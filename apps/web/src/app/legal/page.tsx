import { VerticalSectorPage } from "@/components/VerticalSectorPage";
import { verticalPageMetadata } from "@/lib/vertical-routes";

export const metadata = verticalPageMetadata("legal");

export default function Page() {
  return <VerticalSectorPage vertical="legal" />;
}
