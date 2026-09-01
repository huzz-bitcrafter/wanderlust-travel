import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/layout/SiteLayout";
import { ComingSoon } from "@/components/shared/ComingSoon";

const title = "Contact Us — Wanderlust";
const description =
  "Questions about a trip, a booking or a custom itinerary? Send the Wanderlust team a message.";

export const Route = createFileRoute("/contact")({
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
      <PageHeader eyebrow="Support" title="Contact" description={description} />
      <ComingSoon section="Contact" />
    </SiteLayout>
  );
}
