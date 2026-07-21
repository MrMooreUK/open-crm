import Link from "next/link";
import { listCompanies } from "@/lib/actions/companies";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { ContactForm } from "@/components/contacts/contact-form";

export default async function NewContactPage({
  searchParams,
}: {
  searchParams: Promise<{ companyId?: string }>;
}) {
  const { companyId } = await searchParams;
  const companies = await listCompanies();
  const lockedCompany = companyId
    ? companies.find((c) => c.id === companyId)
    : null;

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader
        title="New contact"
        description={
          lockedCompany
            ? `Adding to ${lockedCompany.name}`
            : "Name, email, and company — that’s enough"
        }
      />
      <Card>
        <CardContent className="pt-4">
          <ContactForm
            companies={companies.map((c) => ({
              id: c.id,
              name: c.name,
              domain: c.domain,
            }))}
            defaultCompanyId={companyId}
            compact
          />
        </CardContent>
      </Card>
      <p className="mt-3 text-center text-xs text-zinc-400">
        <Link href="/contacts" className="hover:text-zinc-700 hover:underline">
          Back to contacts
        </Link>
      </p>
    </div>
  );
}
