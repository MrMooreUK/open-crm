"use client";

import Link from "next/link";
import { Accordion, type AccordionItem } from "@/components/ui/accordion";
import {
  Code,
  DocH,
  DocList,
  DocP,
  DocTable,
  Endpoint,
  Pre,
} from "@/components/docs/doc-primitives";

export function DocsHub({
  baseUrl,
  defaultSection,
}: {
  baseUrl: string;
  defaultSection?: string;
}) {
  const items: AccordionItem[] = [
    {
      id: "overview",
      title: "Overview",
      description: "What open-crm is and how this help is organised",
      content: (
        <div className="space-y-3">
          <DocP>
            <strong className="font-medium text-zinc-800">open-crm</strong> is a
            self-hosted CRM for small teams: companies, contacts, deals,
            pipeline, enquiries, quotes, and team settings—with your data on
            your infrastructure.
          </DocP>
          <DocH>In this documentation</DocH>
          <DocList
            items={[
              "Install & production basics",
              "Architecture overview",
              "HTTP API reference",
              "Contact import / export",
              "Enquiries & quotes",
              "UI patterns",
              "Security checklist",
              "Roadmap snapshot",
            ]}
          />
          <DocP>
            Expand a section below. Full markdown sources also live in the{" "}
            <a
              href="https://github.com/MrMooreUK/open-crm/tree/main/docs"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-brand hover:underline"
            >
              GitHub docs/
            </a>{" "}
            folder.
          </DocP>
        </div>
      ),
    },
    {
      id: "install",
      title: "Install & self-host",
      description: "Docker Compose, secrets, and first login",
      content: (
        <div className="space-y-3">
          <DocH>Docker (recommended)</DocH>
          <Pre>{`git clone https://github.com/MrMooreUK/open-crm.git
cd open-crm
cp .env.example .env
# set BETTER_AUTH_SECRET and public URLs for production
docker compose up -d`}</Pre>
          <DocP>
            App: <Code>{baseUrl}</Code> · Postgres on loopback port 5432 by
            default.
          </DocP>
          <DocH>Required production env</DocH>
          <DocTable
            headers={["Variable", "Purpose"]}
            rows={[
              [
                <Code key="s">BETTER_AUTH_SECRET</Code>,
                "Session signing secret (32+ random chars)",
              ],
              [
                <Code key="u">BETTER_AUTH_URL</Code>,
                "Public browser origin (HTTPS in production)",
              ],
              [<Code key="a">APP_URL</Code>, "Same as BETTER_AUTH_URL"],
              [
                <Code key="p">POSTGRES_PASSWORD</Code>,
                "Optional; change beyond local demos",
              ],
            ]}
          />
          <DocH>First user</DocH>
          <DocP>
            Open the app → Create account → name, organization, email, password.
            A default sales pipeline is created automatically.
          </DocP>
          <DocH>Health check</DocH>
          <Pre>{`curl -s ${baseUrl}/api/health
# {"status":"ok","db":"up"}`}</Pre>
        </div>
      ),
    },
    {
      id: "architecture",
      title: "Architecture",
      description: "Stack, tenancy, and major domains",
      content: (
        <div className="space-y-3">
          <DocP>
            Single Next.js app (App Router) + PostgreSQL via Drizzle. Auth is
            Better Auth (session cookies). CRM writes mostly use Server Actions
            in <Code>lib/actions/*</Code>.
          </DocP>
          <DocH>Domains</DocH>
          <DocList
            items={[
              "Organization — members, invites, profile, branding, regional, team",
              "Companies → Contacts",
              "Pipeline → Stages → Deals (assignment)",
              "Enquiries (inbound leads)",
              "Quotes + quote lines + Services catalog",
              "Activities & tasks",
              "Users — avatar, password, sessions",
            ]}
          />
          <DocH>Tenancy</DocH>
          <DocP>
            Every CRM row is scoped by <Code>organization_id</Code> via{" "}
            <Code>requireMembership()</Code>. Never trust a client-supplied org
            id.
          </DocP>
          <DocH>Uploads</DocH>
          <DocP>
            Logos and avatars live under <Code>public/uploads/</Code> (gitignored
            volume in Docker). Session is required to fetch{" "}
            <Code>/uploads/*</Code>. Default avatar is public static{" "}
            <Code>/default-avatar.svg</Code>.
          </DocP>
        </div>
      ),
    },
    {
      id: "api",
      title: "HTTP API",
      description: "Endpoints, auth, errors, and examples",
      content: (
        <div className="space-y-4">
          <DocP>
            UI-first product. Routes below are the stable HTTP surface. Base
            URL for this instance:
          </DocP>
          <Pre>{baseUrl}</Pre>
          <DocP>
            <strong className="font-medium text-zinc-800">Auth:</strong> session
            cookies from <Code>/api/auth/*</Code>. API tokens are planned later.
            CORS is not open for arbitrary origins.
          </DocP>

          <Endpoint method="GET" path="/api/health" auth="No auth">
            <DocP>Liveness and database connectivity.</DocP>
            <DocH>200</DocH>
            <Pre>{`{ "status": "ok", "db": "up" }`}</Pre>
            <DocH>503</DocH>
            <Pre>{`{ "status": "error", "db": "down" }`}</Pre>
          </Endpoint>

          <Endpoint method="GET" path="/api/v1/me" auth="Session required">
            <DocP>Current user and organization membership.</DocP>
            <DocH>200</DocH>
            <Pre>{`{
  "user": { "id": "…", "name": "…", "email": "…" },
  "organization": { "id": "org_…", "name": "…", "slug": "…" },
  "role": "owner"
}`}</Pre>
            <DocH>401</DocH>
            <Pre>{`{
  "error": { "code": "UNAUTHORIZED", "message": "Not authenticated" }
}`}</Pre>
          </Endpoint>

          <Endpoint method="POST" path="/api/onboarding" auth="Session required">
            <DocP>
              Creates organization + default pipeline when the user has no
              membership (after register).
            </DocP>
            <DocH>Body</DocH>
            <Pre>{`{ "organizationName": "Acme Inc" }`}</Pre>
            <DocH>200</DocH>
            <Pre>{`{ "organizationId": "org_…", "slug": "acme-inc-…" }`}</Pre>
          </Endpoint>

          <Endpoint
            method="GET"
            path="/api/v1/contacts/export"
            auth="Session required"
          >
            <DocP>Download all organization contacts as a file attachment.</DocP>
            <DocTable
              headers={["Param", "Values", "Default"]}
              rows={[
                [
                  <Code key="f">format</Code>,
                  "csv, tsv, json, vcf, xlsx",
                  <Code key="d">csv</Code>,
                ],
              ]}
            />
            <Pre>{`curl -OJ -b 'session=…' \\
  '${baseUrl}/api/v1/contacts/export?format=json'`}</Pre>
          </Endpoint>

          <Endpoint method="*" path="/api/auth/*" auth="Better Auth">
            <DocP>
              Sign-up, sign-in, session, change password, sign-out via{" "}
              <a
                href="https://www.better-auth.com"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-brand hover:underline"
              >
                Better Auth
              </a>
              .
            </DocP>
          </Endpoint>

          <DocH>Error shape (v1)</DocH>
          <Pre>{`{
  "error": {
    "code": "STRING_CODE",
    "message": "Human-readable message"
  }
}`}</Pre>

          <DocH>Server Actions</DocH>
          <DocP>
            Most CRM mutations are Next.js Server Actions under{" "}
            <Code>lib/actions/*</Code>—not public REST yet. Prefer the product UI
            for day-to-day use.
          </DocP>
        </div>
      ),
    },
    {
      id: "contacts-io",
      title: "Contact import & export",
      description: "Formats, column mapping, and limits",
      content: (
        <div className="space-y-3">
          <DocP>
            Open <Link className="font-medium text-brand hover:underline" href="/contacts">Contacts</Link>{" "}
            → Import / Export.
          </DocP>
          <DocTable
            headers={["Format", "Ext", "Import", "Export"]}
            rows={[
              ["CSV", ".csv", "✓", "✓"],
              ["TSV", ".tsv / .tab", "✓", "✓"],
              ["JSON", ".json", "✓", "✓"],
              ["vCard", ".vcf", "✓", "✓"],
              ["Excel", ".xlsx", "✓", "✓"],
            ]}
          />
          <DocH>Limits</DocH>
          <DocList
            items={[
              "Max file size 5 MB",
              "Max 5,000 rows per import",
              "Export: GET /api/v1/contacts/export?format=…",
            ]}
          />
          <DocH>Import behaviour</DocH>
          <DocList
            items={[
              "Flexible header aliases (First Name, email, company, …)",
              "Creates company if name is new",
              "Skips rows whose email already exists in the org",
            ]}
          />
        </div>
      ),
    },
    {
      id: "enquiries-quotes",
      title: "Enquiries & quotes",
      description: "Inbound leads, quoting, and notifications",
      content: (
        <div className="space-y-3">
          <DocH>Enquiries</DocH>
          <DocP>
            Inbound requests with status (
            <Code>new</Code> → <Code>in_progress</Code> → <Code>quoted</Code> →
            won/lost/closed), source, contact fields, optional company/contact
            links, and assignment.
          </DocP>
          <DocP>
            Status <Code>new</Code> drives the notification bell and sidebar
            badge.
          </DocP>
          <DocH>Quotes</DocH>
          <DocList
            items={[
              "Auto number Q-YYYY-0001 per organization",
              "Line items, tax %, bill-to snapshot",
              "Link to enquiry, deal, company, contact",
              "Services catalog for one-click lines",
              "Print / PDF via browser print on /quotes/[id]/print",
            ]}
          />
          <DocH>Deals</DocH>
          <DocP>
            Pipeline Kanban with drag-and-drop. Deal detail shows a stage
            breadcrumb (Pipeline → stages) so the current stage is obvious.
          </DocP>
        </div>
      ),
    },
    {
      id: "ui",
      title: "UI & patterns",
      description: "Layout, tables, and brand tokens",
      content: (
        <div className="space-y-3">
          <DocP>
            Calm <strong className="font-medium text-zinc-800">zinc</strong>{" "}
            chrome with restrained{" "}
            <strong className="font-medium text-zinc-800">teal</strong> for
            primary actions and the logo—dense tables, short copy.
          </DocP>
          <DocH>Data tables</DocH>
          <DocList
            items={[
              "Search and column filters",
              "Show/hide and reorder columns (saved in the browser)",
              "Bulk select and delete on main lists",
            ]}
          />
          <DocH>Forms</DocH>
          <DocList
            items={[
              "Type-to-search selects for companies, contacts, etc.",
              "Pick company → only that company's people in contact lists",
            ]}
          />
          <DocH>Account</DocH>
          <DocP>
            Profile photo (or default avatar), password, and active sessions at{" "}
            <Link href="/account" className="font-medium text-brand hover:underline">
              /account
            </Link>
            .
          </DocP>
        </div>
      ),
    },
    {
      id: "security",
      title: "Security",
      description: "Self-host checklist and reporting",
      content: (
        <div className="space-y-3">
          <DocH>Self-host checklist</DocH>
          <DocList
            items={[
              "Set a unique BETTER_AUTH_SECRET (32+ random characters)",
              "Set BETTER_AUTH_URL / APP_URL to your real public origin (HTTPS in production)",
              "Do not expose Postgres publicly (Compose binds 127.0.0.1 by default)",
              "Change default DB password on shared hosts",
              "Keep .env, backups, and uploads volumes private",
              "Never commit secrets or public/uploads user files",
            ]}
          />
          <DocH>Report vulnerabilities</DocH>
          <DocP>
            Do <strong className="font-medium text-zinc-800">not</strong> open
            public GitHub issues for security problems. Use GitHub Security
            Advisories or private contact—see{" "}
            <Code>SECURITY.md</Code> in the repository.
          </DocP>
        </div>
      ),
    },
    {
      id: "roadmap",
      title: "Roadmap",
      description: "Shipped highlights and what's next",
      content: (
        <div className="space-y-3">
          <DocH>Shipped</DocH>
          <DocList
            items={[
              "Core CRM, pipeline, enquiries, quotes, services",
              "Contact import/export, data tables, bulk delete",
              "Org settings, account, notifications",
              "Docker Compose install",
            ]}
          />
          <DocH>Next (planned)</DocH>
          <DocList
            items={[
              "Company import/export",
              "Keyboard shortcuts",
              "Broader REST API + tokens",
              "Reminders, reports, light automations",
            ]}
          />
          <DocP>
            Influence via GitHub issues with the{" "}
            <Code>enhancement</Code> label.
          </DocP>
        </div>
      ),
    },
  ];

  return (
    <Accordion items={items} defaultOpenId={defaultSection ?? "overview"} />
  );
}
