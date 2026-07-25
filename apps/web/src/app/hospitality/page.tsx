import { VerticalSectorPage } from "@/components/VerticalSectorPage";
import { verticalPageMetadata } from "@/lib/vertical-routes";

export const metadata = verticalPageMetadata("hospitality");

export default function Page() {
  return <VerticalSectorPage vertical="hospitality" />;
}
