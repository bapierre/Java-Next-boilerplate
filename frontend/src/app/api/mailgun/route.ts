import crypto from "crypto";

import { NextResponse, NextRequest } from "next/server";
import { sendEmail } from "@/lib/mailgun";
import { config } from "@/config";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Get your HTTP webhook signing key from https://app.mailgun.com/mg/sending/mg.<yourdomain>/webhooks and add it to .env.local
    const signingKey = process.env.MAILGUN_SIGNING_KEY as string;

    const timestamp = formData.get("timestamp")?.toString() ?? "";
    const token = formData.get("token")?.toString() ?? "";
    const signature = formData.get("signature")?.toString() ?? "";

    // Reject webhooks older than 5 minutes to prevent replay attacks
    const webhookAge = Math.abs(Date.now() / 1000 - Number(timestamp));
    if (webhookAge > 300) {
      return NextResponse.json({ error: "Webhook too old" }, { status: 401 });
    }

    const value = timestamp + token;
    const hash = crypto
      .createHmac("sha256", signingKey)
      .update(value)
      .digest("hex");

    // Timing-safe comparison to prevent timing attacks
    if (!crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature))) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // extract the sender, subject and email content
    const sender = formData.get("From");
    const subject = formData.get("Subject");
    const html = formData.get("body-html");

    // send email to the admin if forwardRepliesTo is set & emailData exists
    if (config.mailgun.forwardRepliesTo && html && subject && sender) {
      // Escape sender and subject to prevent HTML injection
      const safeSender = escapeHtml(String(sender));
      const safeSubject = escapeHtml(String(subject));

      await sendEmail({
        to: config.mailgun.forwardRepliesTo,
        subject: `${config?.appName} | ${subject}`,
        html: `<div><p><b>- Subject:</b> ${safeSubject}</p><p><b>- From:</b> ${safeSender}</p><p><b>- Content:</b></p><div>${html}</div></div>`,
        replyTo: String(sender),
      });
    }

    return NextResponse.json({});
  } catch (e: any) {
    console.error("Mailgun webhook error:", e?.message);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
