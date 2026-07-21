import Link from "next/link";
import { listEnquiries } from "@/lib/actions/enquiries";
import { PageHeader } from "@/components/ui/page-header";
import { requireMembership } from "@/lib/session";
import { EnquiriesTable } from "@/components/enquiries/enquiries-table";

export default async function EnquiriesPage() {
  const [{ organization }, enquiries] = await Promise.all([
    requireMembership(),
    listEnquiries(),
  ]);

  const fmt = {
    locale: organization.locale,
    timezone: organization.timezone,
    dateFormat: organization.dateFormat,
  };

  return (
    <div>
      <PageHeader
        title="Enquiries"
        description={`${enquiries.length} total · inbound requests`}
        actions={
          <Link
            href="/enquiries/new"
            className="btn-primary"
          >
            New enquiry
          </Link>
        }
      />

      {enquiries.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50/50 px-6 py-16 text-center">
          <h3 className="text-sm font-medium text-zinc-900">No enquiries yet</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Capture inbound interest, then generate a quote.
          </p>
          <Link
            href="/enquiries/new"
            className="mt-4 btn-primary btn-primary-sm"
          >
            New enquiry
          </Link>
        </div>
      ) : (
        <EnquiriesTable enquiries={enquiries} formatOpts={fmt} />
      )}
    </div>
  );
}
