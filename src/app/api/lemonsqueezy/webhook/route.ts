// app/api/webhook/route.ts
import { NextResponse } from "next/server";
import { handleWebhook } from "@/utils/lemon";
import crypto from "crypto";

export async function POST(request: Request) {
  const payload = await request.json();
  const signature = request.headers.get("x-signature");

  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("Webhook secret is not defined");
    return NextResponse.json(
      { error: "Webhook configuration error" },
      { status: 500 }
    );
  }
  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(JSON.stringify(payload)).digest("hex");

  if (signature !== digest) {
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 401 }
    );
  }

  try {
    await handleWebhook(payload);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
