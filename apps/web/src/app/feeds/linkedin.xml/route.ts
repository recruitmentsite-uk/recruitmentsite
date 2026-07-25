import { getJobs } from "@/lib/jobs";
import { buildLinkedInFeed } from "@/lib/linkedin-feed";

export const dynamic = "force-dynamic";

export async function GET() {
  const jobs = await getJobs();
  const xml = buildLinkedInFeed(jobs);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
