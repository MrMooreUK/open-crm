import { headers } from "next/headers";
import { ExternalLink } from "lucide-react";
import { requireMembership } from "@/lib/session";
import { DocsHub } from "@/components/docs/docs-hub";
import { PageHeader } from "@/components/ui/page-header";

const VALID_SECTIONS = new Set([
  "overview",
  "install",
  "architecture",
  "api",
  "contacts-io",
  "enquiries-quotes",
  "ui",
  "security",
  "roadmap",
]);

export default async function DocsPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  await requireMembership();
  const { section } = await searchParams;
  const defaultSection =
    section && VALID_SECTIONS.has(section) ? section : "overview";

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  const baseUrl =
    process.env.APP_URL ||
    process.env.BETTER_AUTH_URL ||
    (host ? `${proto}://${host}` : "http://localhost:3000");

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Documentation"
        description="Install, architecture, API, workflows, and security—expand a section"
        actions={
          <a
            href="https://github.com/MrMooreUK/open-crm/tree/main/docs"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Docs on GitHub
          </a>
        }
      />

      <DocsHub baseUrl={baseUrl} defaultSection={defaultSection} />
    </div>
  );
}
