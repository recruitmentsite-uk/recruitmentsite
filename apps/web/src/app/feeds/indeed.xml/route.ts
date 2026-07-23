import { getJobs } from "@/lib/jobs";
import { buildIndeedFeed } from "@/lib/indeed-feed";

export async function GET() {
  const jobs = await getJobs();
  const xml = buildIndeedFeed(jobs);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
