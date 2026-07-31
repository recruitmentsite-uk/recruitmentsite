import type { Metadata } from "next";
import VideoScreenClient from "./VideoScreenClient";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...noIndexMetadata,
  title: "Video screening",
};

export default async function ScreenPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <VideoScreenClient token={token} />;
}
