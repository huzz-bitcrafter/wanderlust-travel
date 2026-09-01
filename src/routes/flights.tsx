import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/layout/SiteLayout";
import { ComingSoon } from "@/components/shared/ComingSoon";

const title = "Flights — Wanderlust";
const description =
  "Search flights by origin, destination, date and cabin class, then book in a few steps.";

export const Route = createFileRoute("/flights")({
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
      <PageHeader eyebrow="Fly" title="Flights" description={description} />
      <ComingSoon section="Flights" />
    </SiteLayout>
  );
}
