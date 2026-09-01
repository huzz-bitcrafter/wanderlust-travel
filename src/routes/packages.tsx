import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/layout/SiteLayout";
import { ComingSoon } from "@/components/shared/ComingSoon";

const title = "Tour Packages — Wanderlust";
const description =
  "Compare guided tour packages by price, duration and difficulty, with full day-by-day itineraries.";

export const Route = createFileRoute("/packages")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <PageHeader eyebrow="Explore" title="Tour Packages" description={description} />
      <ComingSoon section="Tour Packages" />
    </SiteLayout>
  );
}
