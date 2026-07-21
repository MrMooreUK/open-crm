import Link from "next/link";
import { listServices } from "@/lib/actions/services";
import { requireMembership } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import { ServicesManager } from "@/components/services/services-manager";

export default async function ServicesPage() {
  const [{ organization }, services] = await Promise.all([
    requireMembership(),
    listServices(),
  ]);

  return (
    <div>
      <PageHeader
        title="Services"
        description="Catalog of rates for faster quoting"
        actions={
          <Link
            href="/quotes/new"
            className="inline-flex h-9 items-center rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            New quote
          </Link>
        }
      />
      <ServicesManager
        services={services}
        defaultCurrency={organization.currency}
      />
    </div>
  );
}
