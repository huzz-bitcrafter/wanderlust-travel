import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/layout/SiteLayout";
import { ComingSoon } from "@/components/shared/ComingSoon";

const title = "Hotels — Wanderlust";
const description =
  "Find and book stays from clifftop suites to riads and safari camps, with live price calculation.";

export const Route = createFileRoute("/hotels")({
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
      <PageHeader eyebrow="Stay" title="Hotels" description={description} />
      <ComingSoon section="Hotels" />
    </SiteLayout>
  );
}
