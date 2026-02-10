import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — MarketiStats",
};

export default function PrivacyPolicy() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <Link
        href="/"
        className="text-gray-500 hover:text-gray-900 text-sm inline-flex items-center gap-1 mb-8"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4"
        >
          <path
            fillRule="evenodd"
            d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
            clipRule="evenodd"
          />
        </svg>
        Back to home
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-gray-500 text-sm mb-10">Last updated: 10 February 2026</p>

      <div className="prose prose-gray max-w-none text-gray-700 space-y-6 text-[15px] leading-relaxed">
        <p>
          MarketiStats (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the website{" "}
          <a href="https://marketistats.com" className="text-purple-600 hover:underline">
            marketistats.com
          </a>{" "}
          (the &quot;Service&quot;). This Privacy Policy explains how we collect, use, disclose,
          and safeguard your personal data when you use our Service, in compliance with the
          General Data Protection Regulation (EU) 2016/679 (&quot;GDPR&quot;) and applicable
          European Union data protection legislation.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 pt-4">1. Data Controller</h2>
        <p>
          The data controller responsible for your personal data is MarketiStats. For any
          questions regarding this policy or your data, contact us at:{" "}
          <a href="mailto:contact@marketistats.com" className="text-purple-600 hover:underline">
            contact@marketistats.com
          </a>
        </p>

        <h2 className="text-xl font-semibold text-gray-900 pt-4">2. Personal Data We Collect</h2>
        <p>We collect the following categories of personal data:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Account data:</strong> name, email address, and profile picture (provided
            during registration or via Google OAuth through Supabase).
          </li>
          <li>
            <strong>Payment data:</strong> billing information processed by Stripe. We do not
            store credit card numbers on our servers — Stripe handles this as an independent
            data processor.
          </li>
          <li>
            <strong>Connected social accounts:</strong> when you connect a social media platform
            (TikTok, Instagram, YouTube, X/Twitter, Facebook), we store OAuth tokens
            and your public channel name to retrieve analytics on your behalf.
          </li>
          <li>
            <strong>Usage data:</strong> IP address, browser type, pages visited, and timestamps,
            collected automatically through server logs and cookies.
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-gray-900 pt-4">3. Legal Basis for Processing</h2>
        <p>Under Article 6 of the GDPR, we process your personal data on the following bases:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Contract performance (Art. 6(1)(b)):</strong> processing necessary to provide
            the Service you signed up for, including account management, social channel
            connections, and analytics retrieval.
          </li>
          <li>
            <strong>Legitimate interest (Art. 6(1)(f)):</strong> analytics on Service usage to
            improve functionality and security, fraud prevention, and maintaining system integrity.
          </li>
          <li>
            <strong>Consent (Art. 6(1)(a)):</strong> where you explicitly opt in to marketing
            communications or connect optional third-party accounts. You may withdraw consent
            at any time.
          </li>
          <li>
            <strong>Legal obligation (Art. 6(1)(c)):</strong> where we are required to retain
            data for tax, accounting, or regulatory purposes.
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-gray-900 pt-4">4. How We Use Your Data</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>To create and manage your account.</li>
          <li>To connect your social media channels and retrieve public analytics data.</li>
          <li>To process payments and manage subscriptions via Stripe.</li>
          <li>To send transactional emails (account confirmations, password resets).</li>
          <li>To improve, maintain, and secure the Service.</li>
          <li>To comply with legal obligations.</li>
        </ul>

        <h2 className="text-xl font-semibold text-gray-900 pt-4">5. Data Sharing and Third-Party Processors</h2>
        <p>
          We do not sell your personal data. We share data only with the following processors,
          each of whom operates under a Data Processing Agreement (DPA) compliant with the GDPR:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Supabase</strong> — authentication and database hosting (EU-available regions).
          </li>
          <li>
            <strong>Stripe</strong> — payment processing (certified PCI DSS Level 1).
          </li>
          <li>
            <strong>Social media platforms</strong> (TikTok, Instagram/Meta, YouTube/Google,
            X/Twitter, Facebook/Meta) — only via OAuth tokens you explicitly authorize,
            limited to reading public analytics data.
          </li>
        </ul>
        <p>
          If any processor transfers data outside the European Economic Area (EEA), such
          transfers are protected by Standard Contractual Clauses (SCCs) or an adequacy decision
          by the European Commission.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 pt-4">6. Cookies</h2>
        <p>We use the following types of cookies:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Strictly necessary cookies:</strong> authentication session cookies
            (Supabase JWT). These are essential for the Service to function and do not require
            consent.
          </li>
        </ul>
        <p>
          We do not use advertising or third-party tracking cookies. No cookie consent banner
          is required because we only use strictly necessary cookies as defined by the ePrivacy
          Directive (2002/58/EC).
        </p>

        <h2 className="text-xl font-semibold text-gray-900 pt-4">7. Data Retention</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Account data:</strong> retained for as long as your account is active. Upon
            account deletion, personal data is erased within 30 days, except where retention is
            required by law.
          </li>
          <li>
            <strong>Payment records:</strong> retained for the legally required period (typically
            10 years under EU tax regulations).
          </li>
          <li>
            <strong>OAuth tokens:</strong> deleted immediately when you disconnect a channel or
            delete your account.
          </li>
          <li>
            <strong>Server logs:</strong> retained for a maximum of 90 days, then automatically
            purged.
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-gray-900 pt-4">8. Your Rights Under the GDPR</h2>
        <p>As a data subject in the EU/EEA, you have the following rights:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Right of access (Art. 15):</strong> request a copy of the personal data we
            hold about you.
          </li>
          <li>
            <strong>Right to rectification (Art. 16):</strong> request correction of inaccurate
            or incomplete data.
          </li>
          <li>
            <strong>Right to erasure (Art. 17):</strong> request deletion of your personal data
            (&quot;right to be forgotten&quot;).
          </li>
          <li>
            <strong>Right to restriction (Art. 18):</strong> request that we limit how we
            process your data.
          </li>
          <li>
            <strong>Right to data portability (Art. 20):</strong> receive your data in a
            structured, machine-readable format.
          </li>
          <li>
            <strong>Right to object (Art. 21):</strong> object to processing based on legitimate
            interest.
          </li>
          <li>
            <strong>Right to withdraw consent (Art. 7(3)):</strong> where processing is based on
            consent, withdraw it at any time without affecting the lawfulness of prior processing.
          </li>
        </ul>
        <p>
          To exercise any of these rights, email us at{" "}
          <a href="mailto:contact@marketistats.com" className="text-purple-600 hover:underline">
            contact@marketistats.com
          </a>
          . We will respond within 30 days as required by the GDPR.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 pt-4">9. Data Security</h2>
        <p>
          We implement appropriate technical and organisational measures to protect your personal
          data, including encrypted connections (TLS), secure authentication tokens, and access
          controls. However, no method of transmission over the internet is 100% secure, and we
          cannot guarantee absolute security.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 pt-4">10. Children&apos;s Privacy</h2>
        <p>
          The Service is not directed to individuals under the age of 16. We do not knowingly
          collect personal data from children. If we become aware that we have collected data
          from a child under 16 without parental consent, we will delete it promptly.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 pt-4">11. Supervisory Authority</h2>
        <p>
          If you believe that our processing of your personal data infringes the GDPR, you have
          the right to lodge a complaint with a supervisory authority in the EU Member State of
          your habitual residence, place of work, or place of the alleged infringement.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 pt-4">12. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Material changes will be
          communicated via the email address associated with your account at least 14 days
          before they take effect. The &quot;Last updated&quot; date at the top of this page
          reflects the most recent revision.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 pt-4">13. Contact</h2>
        <p>
          For any questions, requests, or complaints regarding this Privacy Policy or your
          personal data, contact us at:
        </p>
        <p>
          MarketiStats<br />
          Email:{" "}
          <a href="mailto:contact@marketistats.com" className="text-purple-600 hover:underline">
            contact@marketistats.com
          </a>
        </p>
      </div>
    </main>
  );
}
