import { VerticalSectorPage } from "@/components/VerticalSectorPage";
import { verticalPageMetadata } from "@/lib/vertical-routes";

export const metadata = verticalPageMetadata("marketing");

export default function Page() {
  return <VerticalSectorPage vertical="marketing" />;
}
