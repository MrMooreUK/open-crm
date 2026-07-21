import { listCompanies } from "@/lib/actions/companies";
import { listContacts } from "@/lib/actions/contacts";
import { getDefaultPipeline } from "@/lib/actions/deals";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { DealForm } from "@/components/deals/deal-form";

export default async function NewDealPage({
  searchParams,
}: {
  searchParams: Promise<{ companyId?: string }>;
}) {
  const { companyId } = await searchParams;
  const [companies, contacts, pipeline] = await Promise.all([
    listCompanies(),
    listContacts(),
    getDefaultPipeline(),
  ]);

  const stages = pipeline?.stages ?? [];
  const defaultStageId =
    stages.find((s) => !s.isWon && !s.isLost)?.id ?? stages[0]?.id;

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="New deal" description="Add an opportunity" />
      <Card>
        <CardContent className="pt-4">
          <DealForm
            stages={stages.map((s) => ({ id: s.id, name: s.name }))}
            companies={companies.map((c) => ({ id: c.id, name: c.name }))}
            contacts={contacts.map((c) => ({
              id: c.id,
              firstName: c.firstName,
              lastName: c.lastName,
            }))}
            defaultCompanyId={companyId}
            defaultStageId={defaultStageId}
          />
        </CardContent>
      </Card>
    </div>
  );
}
