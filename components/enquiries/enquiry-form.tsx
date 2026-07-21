"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { createEnquiry, updateEnquiry } from "@/lib/actions/enquiries";
import {
  contactBelongsToCompany,
  filterContactsByCompany,
} from "@/lib/crm-links";
import {
  AssigneeSelect,
  type AssigneeOption,
} from "@/components/team/assignee-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";

type Enquiry = {
  id: string;
  title: string;
  status: string;
  source: string;
  message: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  companyId: string | null;
  contactId: string | null;
  ownerId: string | null;
};

export function EnquiryForm({
  enquiry,
  companies,
  contacts,
  members,
  currentUserId,
}: {
  enquiry?: Enquiry;
  companies: { id: string; name: string }[];
  contacts: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string | null;
    phone?: string | null;
    companyId?: string | null;
  }[];
  members: AssigneeOption[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [companyId, setCompanyId] = useState(enquiry?.companyId ?? "");
  const [contactId, setContactId] = useState(enquiry?.contactId ?? "");
  const [contactName, setContactName] = useState(enquiry?.contactName ?? "");
  const [contactEmail, setContactEmail] = useState(
    enquiry?.contactEmail ?? ""
  );
  const [contactPhone, setContactPhone] = useState(
    enquiry?.contactPhone ?? ""
  );

  const selectedCompany = companies.find((c) => c.id === companyId);
  const visibleContacts = useMemo(
    () => filterContactsByCompany(contacts, companyId),
    [contacts, companyId]
  );

  function applyCompany(id: string) {
    setCompanyId(id);
    if (
      contactId &&
      !contactBelongsToCompany(
        contacts.find((c) => c.id === contactId),
        id
      )
    ) {
      setContactId("");
    }
  }

  function applyContact(id: string) {
    setContactId(id);
    if (!id) return;
    const c = contacts.find((x) => x.id === id);
    if (!c) return;
    const name = `${c.firstName} ${c.lastName}`.trim();
    if (name) setContactName(name);
    if (c.email) setContactEmail(c.email);
    if (c.phone) setContactPhone(c.phone);
    if (c.companyId) setCompanyId(c.companyId);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("companyId", companyId);
    formData.set("contactId", contactId);
    formData.set("contactName", contactName);
    formData.set("contactEmail", contactEmail);
    formData.set("contactPhone", contactPhone);
    const result = enquiry
      ? await updateEnquiry(enquiry.id, formData)
      : await createEnquiry(formData);
    setLoading(false);

    if ("error" in result && result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(enquiry ? "Enquiry updated" : "Enquiry created");
    const id = enquiry?.id ?? ("id" in result ? result.id : undefined);
    if (id) {
      router.push(`/enquiries/${id}`);
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="title">Subject</Label>
        <Input
          id="title"
          name="title"
          required
          placeholder="Website redesign inquiry"
          defaultValue={enquiry?.title}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <Select
            id="status"
            name="status"
            defaultValue={enquiry?.status ?? "new"}
          >
            <option value="new">New</option>
            <option value="in_progress">In progress</option>
            <option value="quoted">Quoted</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
            <option value="closed">Closed</option>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="source">Source</Label>
          <Select
            id="source"
            name="source"
            defaultValue={enquiry?.source ?? "other"}
          >
            <option value="web">Web</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="referral">Referral</option>
            <option value="other">Other</option>
          </Select>
        </div>
      </div>

      <AssigneeSelect
        members={members}
        defaultValue={enquiry?.ownerId ?? currentUserId}
        label="Assigned to"
        allowUnassigned
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Company</Label>
          <SearchableSelect
            value={companyId}
            onChange={applyCompany}
            placeholder="Type to search companies…"
            emptyLabel="No company"
            options={companies.map((c) => ({
              id: c.id,
              label: c.name,
            }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Linked contact</Label>
          <SearchableSelect
            value={contactId}
            onChange={applyContact}
            placeholder={
              companyId
                ? "Search people at this company…"
                : "Type to search contacts…"
            }
            emptyLabel="None — fill details below"
            options={visibleContacts.map((c) => {
              const co = companies.find((x) => x.id === c.companyId);
              return {
                id: c.id,
                label: `${c.firstName} ${c.lastName}`.trim(),
                sublabel:
                  [c.email, !companyId ? co?.name : null]
                    .filter(Boolean)
                    .join(" · ") || undefined,
                meta: `${c.email ?? ""} ${c.phone ?? ""} ${co?.name ?? ""}`,
              };
            })}
          />
          <p className="text-[11px] text-zinc-400">
            {companyId
              ? visibleContacts.length === 0
                ? "No people linked to this company yet — fill details below"
                : `Showing people at ${selectedCompany?.name ?? "this company"} · fills name, email, phone`
              : "Pick a company to narrow contacts, or pick a contact to fill company"}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="contactName">Contact name</Label>
          <Input
            id="contactName"
            name="contactName"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Jane Buyer"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contactEmail">Contact email</Label>
          <Input
            id="contactEmail"
            name="contactEmail"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contactPhone">Contact phone</Label>
        <Input
          id="contactPhone"
          name="contactPhone"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="message">Message / details</Label>
        <Textarea
          id="message"
          name="message"
          rows={4}
          placeholder="What are they asking for?"
          defaultValue={enquiry?.message ?? ""}
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving…" : enquiry ? "Save changes" : "Create enquiry"}
      </Button>
    </form>
  );
}
