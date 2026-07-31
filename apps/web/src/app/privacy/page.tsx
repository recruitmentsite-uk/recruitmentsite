import { CV_RETENTION_DAYS, SITE_NAME, COMPANY_LEGAL_NAME, COMPANY_NUMBER, COMPANY_VAT_NUMBER, COMPANY_REGISTERED_ADDRESS } from "@placeuk/shared";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Privacy Policy",
  description: `How ${SITE_NAME} collects, uses, and protects your data. GDPR compliant. CV retention: ${CV_RETENTION_DAYS} days.`,
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 prose prose-slate">
      <h1>Privacy Policy</h1>
      <p className="text-sm text-slate-500">Last updated: July 2026</p>

      <h2>Who we are</h2>
      <p>
        {SITE_NAME} (&quot;we&quot;, &quot;us&quot;) is a trading name of {COMPANY_LEGAL_NAME} (Company No.{" "}
        {COMPANY_NUMBER}, VAT No. {COMPANY_VAT_NUMBER}), registered in England and Wales. Registered office:{" "}
        {COMPANY_REGISTERED_ADDRESS}.
      </p>
      <p>
        We operate an automated UK job board and hiring platform and are the data controller for personal
        data collected through this website.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li><strong>Candidates:</strong> name, email, CV, cover notes, right-to-work confirmation</li>
        <li><strong>Employers:</strong> company name, contact details, billing information (via Stripe)</li>
        <li><strong>All users:</strong> cookies, IP address, usage analytics</li>
      </ul>

      <h2>How we use your data</h2>
      <ul>
        <li>Process job applications and share CVs with the relevant employer</li>
        <li>Send job alert emails you have opted into</li>
        <li>AI-assisted matching and screening (with human review available on request)</li>
        <li>Billing and account management for employers</li>
      </ul>

      <h2>Legal basis (UK GDPR)</h2>
      <ul>
        <li><strong>Consent:</strong> job applications, job alerts, marketing emails</li>
        <li><strong>Contract:</strong> employer subscriptions and job posting services</li>
        <li><strong>Legitimate interest:</strong> fraud prevention, platform security</li>
      </ul>

      <h2>Data retention</h2>
      <p>
        CVs and application data are retained for up to <strong>{CV_RETENTION_DAYS} days</strong> unless
        you request earlier deletion or are hired (in which case the employer becomes the data controller).
      </p>

      <h2>Your rights</h2>
      <p>
        You have the right to access, rectify, erase, restrict, or port your data, and to withdraw consent.
        Contact: <a href="mailto:privacy@recruitmentsite.co.uk">privacy@recruitmentsite.co.uk</a>
      </p>

      <h2>Third parties</h2>
      <p>
        We use Supabase (hosting/database), Stripe (payments), Resend (email), and OpenAI (CV matching).
        Data may be processed in the UK, EEA, or US under appropriate safeguards.
      </p>
    </div>
  );
}
