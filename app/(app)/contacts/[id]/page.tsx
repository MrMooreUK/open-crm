import Link from "next/link";
import { notFound } from "next/navigation";
import { getContact } from "@/lib/actions/contacts";
import { listCompanies } from "@/lib/actions/companies";
import { listActivitiesFor } from "@/lib/actions/activities";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContactForm } from "@/components/contacts/contact-form";
import { DeleteContactButton } from "@/components/contacts/delete-contact-button";
import { ActivityTimeline } from "@/components/activities/activity-timeline";
import { formatCurrency, fullName } from "@/lib/utils";

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contact = await getContact(id);
  if (!contact) notFound();

  const [companies, activityList] = await Promise.all([
    listCompanies(),
    listActivitiesFor({ contactId: id }),
  ]);

  return (
    <div>
      <PageHeader
        title={fullName(contact.firstName, contact.lastName)}
        description={
          [contact.title, contact.company?.name].filter(Boolean).join(" · ") ||
          "Contact"
        }
        actions={<DeleteContactButton id={contact.id} />}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <ContactForm
                contact={contact}
                companies={companies.map((c) => ({ id: c.id, name: c.name }))}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Deals</CardTitle>
            </CardHeader>
            <CardContent>
              {contact.deals.length === 0 ? (
                <p className="text-sm text-zinc-500">No deals linked.</p>
              ) : (
                <ul className="divide-y divide-zinc-100">
                  {contact.deals.map((d) => (
                    <li
                      key={d.id}
                      className="flex items-center justify-between py-2"
                    >
                      <Link
                        href={`/deals/${d.id}`}
                        className="text-sm font-medium hover:underline"
                      >
                        {d.title}
                      </Link>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-500">
                          {formatCurrency(d.amountCents, d.currency)}
                        </span>
                        <Badge variant="secondary">{d.stage.name}</Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <ActivityTimeline
            activities={activityList}
            contactId={contact.id}
            companyId={contact.companyId ?? undefined}
          />
        </div>
      </div>
    </div>
  );
}
