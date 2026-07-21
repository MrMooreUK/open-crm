import { listCompanies } from "@/lib/actions/companies";
import { listContacts, getContact } from "@/lib/actions/contacts";
import { getDefaultPipeline } from "@/lib/actions/deals";
import { listTeamMembers } from "@/lib/team";
import { requireMembership } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { DealForm } from "@/components/deals/deal-form";

export default async function NewDealPage({
  searchParams,
}: {
  searchParams: Promise<{ companyId?: string; contactId?: string }>;
}) {
  const { companyId, contactId } = await searchParams;
  const [
    { organization, user },
    companies,
    contacts,
    pipeline,
    members,
    contact,
  ] = await Promise.all([
    requireMembership(),
    listCompanies(),
    listContacts(),
    getDefaultPipeline(),
    listTeamMembers(),
    contactId ? getContact(contactId) : Promise.resolve(null),
  ]);

  const stages = pipeline?.stages ?? [];
  const defaultStageId =
    stages.find((s) => !s.isWon && !s.isLost)?.id ?? stages[0]?.id;

  const resolvedCompanyId =
    companyId || contact?.companyId || undefined;

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader
        title="New deal"
        description={
          contact
            ? `For ${contact.firstName} ${contact.lastName}`
            : "Add an opportunity"
        }
      />
      <Card>
        <CardContent className="pt-4">
          <DealForm
            stages={stages.map((s) => ({ id: s.id, name: s.name }))}
            companies={companies.map((c) => ({ id: c.id, name: c.name }))}
            contacts={contacts.map((c) => ({
              id: c.id,
              firstName: c.firstName,
              lastName: c.lastName,
              email: c.email,
              phone: c.phone,
              title: c.title,
              companyId: c.companyId,
            }))}
            members={members.map((m) => ({
              userId: m.userId,
              name: m.name,
              email: m.email,
            }))}
            currentUserId={user.id}
            defaultCompanyId={resolvedCompanyId}
            defaultContactId={contactId}
            defaultStageId={defaultStageId}
            defaultCurrency={organization.currency}
          />
        </CardContent>
      </Card>
    </div>
  );
}
