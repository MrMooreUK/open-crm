import { notFound } from "next/navigation";
import { getDeal, getDefaultPipeline } from "@/lib/actions/deals";
import { listCompanies } from "@/lib/actions/companies";
import { listContacts } from "@/lib/actions/contacts";
import { listActivitiesFor } from "@/lib/actions/activities";
import { requireMembership } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DealForm } from "@/components/deals/deal-form";
import { DeleteDealButton } from "@/components/deals/delete-deal-button";
import { ActivityTimeline } from "@/components/activities/activity-timeline";
import { formatCurrency } from "@/lib/utils";

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const deal = await getDeal(id);
  if (!deal) notFound();

  const [{ organization }, companies, contacts, pipeline, activityList] =
    await Promise.all([
      requireMembership(),
      listCompanies(),
      listContacts(),
      getDefaultPipeline(),
      listActivitiesFor({ dealId: id }),
    ]);

  const stages = pipeline?.stages ?? [];

  return (
    <div>
      <PageHeader
        title={deal.title}
        description={`${formatCurrency(deal.amountCents, deal.currency, organization.locale)} · ${deal.stage.name}`}
        actions={
          <div className="flex items-center gap-2">
            <Badge
              variant={
                deal.stage.isWon
                  ? "success"
                  : deal.stage.isLost
                    ? "danger"
                    : "secondary"
              }
            >
              {deal.stage.name}
            </Badge>
            <DeleteDealButton id={deal.id} />
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <DealForm
                deal={deal}
                stages={stages.map((s) => ({ id: s.id, name: s.name }))}
                companies={companies.map((c) => ({ id: c.id, name: c.name }))}
                contacts={contacts.map((c) => ({
                  id: c.id,
                  firstName: c.firstName,
                  lastName: c.lastName,
                }))}
                defaultCurrency={organization.currency}
              />
            </CardContent>
          </Card>
        </div>
        <div>
          <ActivityTimeline
            activities={activityList}
            dealId={deal.id}
            companyId={deal.companyId ?? undefined}
            contactId={deal.contactId ?? undefined}
          />
        </div>
      </div>
    </div>
  );
}
