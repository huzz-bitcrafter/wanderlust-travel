import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/layout/SiteLayout";
import { ComingSoon } from "@/components/shared/ComingSoon";

const title = "Create Account — Wanderlust";
const description =
  "Create a free Wanderlust account to save trips and keep every booking in one dashboard.";

export const Route = createFileRoute("/register")({
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
      <PageHeader eyebrow="Account" title="Create Account" description={description} />
      <ComingSoon section="Create Account" />
    </SiteLayout>
  );
}
