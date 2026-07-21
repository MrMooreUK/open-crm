import { listCompanies } from "@/lib/actions/companies";
import { listContacts } from "@/lib/actions/contacts";
import { listTeamMembers } from "@/lib/team";
import { requireMembership } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EnquiryForm } from "@/components/enquiries/enquiry-form";

export default async function NewEnquiryPage() {
  const [{ user }, companies, contacts, members] = await Promise.all([
    requireMembership(),
    listCompanies(),
    listContacts(),
    listTeamMembers(),
  ]);

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader
        title="New enquiry"
        description="Log an inbound request or lead"
      />
      <Card>
        <CardContent className="pt-4">
          <EnquiryForm
            companies={companies.map((c) => ({ id: c.id, name: c.name }))}
            contacts={contacts.map((c) => ({
              id: c.id,
              firstName: c.firstName,
              lastName: c.lastName,
              email: c.email,
              phone: c.phone,
              companyId: c.companyId,
            }))}
            members={members.map((m) => ({
              userId: m.userId,
              name: m.name,
              email: m.email,
            }))}
            currentUserId={user.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
