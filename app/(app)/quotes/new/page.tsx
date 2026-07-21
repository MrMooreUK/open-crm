import { listCompanies } from "@/lib/actions/companies";
import { listContacts, getContact } from "@/lib/actions/contacts";
import { listDeals, getDeal } from "@/lib/actions/deals";
import { listEnquiries, getEnquiry } from "@/lib/actions/enquiries";
import { listServices } from "@/lib/actions/services";
import { requireMembership } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { QuoteForm } from "@/components/quotes/quote-form";
import { fullName } from "@/lib/utils";

export default async function NewQuotePage({
  searchParams,
}: {
  searchParams: Promise<{
    enquiryId?: string;
    dealId?: string;
    companyId?: string;
    contactId?: string;
  }>;
}) {
  const { enquiryId, dealId, companyId, contactId } = await searchParams;
  const [
    { organization },
    companies,
    contacts,
    enquiries,
    deals,
    services,
    enquiry,
    deal,
    contact,
  ] = await Promise.all([
    requireMembership(),
    listCompanies(),
    listContacts(),
    listEnquiries(),
    listDeals(),
    listServices({ activeOnly: true }),
    enquiryId ? getEnquiry(enquiryId) : Promise.resolve(null),
    dealId ? getDeal(dealId) : Promise.resolve(null),
    contactId ? getContact(contactId) : Promise.resolve(null),
  ]);

  const resolvedContact = contact || deal?.contact || enquiry?.contact || null;
  const resolvedCompanyId =
    companyId ||
    deal?.companyId ||
    enquiry?.companyId ||
    contact?.companyId ||
    resolvedContact?.companyId ||
    undefined;
  const resolvedCompany =
    companies.find((c) => c.id === resolvedCompanyId) ||
    deal?.company ||
    enquiry?.company ||
    null;

  const defaultBillTo = {
    name:
      enquiry?.contactName ||
      (resolvedContact
        ? fullName(resolvedContact.firstName, resolvedContact.lastName)
        : undefined),
    email:
      enquiry?.contactEmail ||
      resolvedContact?.email ||
      undefined,
    company: resolvedCompany?.name || enquiry?.company?.name,
  };

  const defaultTitle =
    enquiry?.title || deal?.title || undefined;

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="New quote"
        description={
          enquiry
            ? `From enquiry: ${enquiry.title} · valid 30 days by default`
            : deal
              ? `From deal: ${deal.title} · valid 30 days by default`
              : "Valid 30 days by default · pull contact to fill bill-to"
        }
      />
      <Card>
        <CardContent className="pt-4">
          <QuoteForm
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
            enquiries={enquiries.map((e) => ({ id: e.id, title: e.title }))}
            deals={deals.map((d) => ({ id: d.id, title: d.title }))}
            services={services.map((s) => ({
              id: s.id,
              name: s.name,
              description: s.description,
              unitPriceCents: s.unitPriceCents,
              unit: s.unit,
              currency: s.currency,
            }))}
            defaultCurrency={organization.currency}
            defaultEnquiryId={enquiryId}
            defaultDealId={dealId}
            defaultCompanyId={resolvedCompanyId}
            defaultContactId={
              contactId ||
              resolvedContact?.id ||
              enquiry?.contactId ||
              deal?.contactId ||
              undefined
            }
            defaultBillTo={defaultBillTo}
            defaultTitle={defaultTitle}
          />
        </CardContent>
      </Card>
    </div>
  );
}
