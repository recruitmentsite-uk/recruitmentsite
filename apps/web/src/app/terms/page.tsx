import { SITE_NAME, COMPANY_LEGAL_NAME, COMPANY_NUMBER, COMPANY_VAT_NUMBER, COMPANY_REGISTERED_ADDRESS } from "@placeuk/shared";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Terms of Service",
  description: `Terms and conditions for using ${SITE_NAME} as a candidate or employer. Subscriptions, applications, and acceptable use.`,
  path: "/terms",
});

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 prose prose-slate">
      <h1>Terms of Service</h1>
      <p className="text-sm text-slate-500">Last updated: July 2026</p>

      <h2>1. Service</h2>
      <p>
        {SITE_NAME} is a trading name of {COMPANY_LEGAL_NAME} (Company No. {COMPANY_NUMBER}, VAT No.{" "}
        {COMPANY_VAT_NUMBER}), registered in England and Wales with registered office at{" "}
        {COMPANY_REGISTERED_ADDRESS}.
      </p>
      <p>
        We provide an online job board and hiring platform for UK employers and job seekers.
        We are a technology platform, not an employment agency. We do not guarantee hires.
      </p>

      <h2>2. Employer accounts</h2>
      <ul>
        <li>Subscriptions are billed monthly or annually via Stripe</li>
        <li>Job posts must include accurate salary information and genuine vacancies</li>
        <li>We reserve the right to remove fraudulent, discriminatory, or misleading listings</li>
        <li>Plan limits (active jobs, featured slots) are enforced automatically</li>
      </ul>

      <h2>3. Candidate applications</h2>
      <ul>
        <li>Applications are free; you must provide accurate information</li>
        <li>Your CV is shared with the employer you apply to</li>
        <li>We may use AI to score your application against job requirements</li>
      </ul>

      <h2>4. Acceptable use</h2>
      <p>
        You must not post fake jobs, scrape candidate data, discriminate unlawfully, or circumvent
        platform fees. Violations may result in account suspension without refund.
      </p>

      <h2>5. Limitation of liability</h2>
      <p>
        {SITE_NAME} is provided &quot;as is&quot;. We are not liable for hiring decisions, employment
        disputes, or losses arising from use of the platform. Our total liability is limited to fees
        paid in the preceding 12 months.
      </p>

      <h2>6. Governing law</h2>
      <p>These terms are governed by the laws of England and Wales.</p>

      <p>Contact: <a href="mailto:legal@recruitmentsite.co.uk">legal@recruitmentsite.co.uk</a></p>
    </div>
  );
}
