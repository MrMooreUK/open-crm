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

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="New contact" description="Add a person" />
      <Card>
        <CardContent className="pt-4">
          <ContactForm
            companies={companies.map((c) => ({ id: c.id, name: c.name }))}
            defaultCompanyId={companyId}
          />
        </CardContent>
      </Card>
    </div>
  );
}
