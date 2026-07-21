"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { createDeal, updateDeal } from "@/lib/actions/deals";
import {
  contactBelongsToCompany,
  filterContactsByCompany,
} from "@/lib/crm-links";
import { CURRENCIES } from "@/lib/settings-options";
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

type Deal = {
  id: string;
  title: string;
  amountCents: number;
  currency: string;
  stageId: string;
  companyId: string | null;
  contactId: string | null;
  expectedCloseAt: Date | null;
  notes: string | null;
  ownerId: string | null;
};

export function DealForm({
  deal,
  stages,
  companies,
  contacts,
  members = [],
  currentUserId,
  defaultCompanyId,
  defaultContactId,
  defaultStageId,
  defaultCurrency = "USD",
}: {
  deal?: Deal;
  stages: { id: string; name: string }[];
  companies: { id: string; name: string }[];
  contacts: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string | null;
    phone?: string | null;
    title?: string | null;
    companyId?: string | null;
  }[];
  members?: AssigneeOption[];
  currentUserId?: string;
  defaultCompanyId?: string;
  defaultContactId?: string;
  defaultStageId?: string;
  defaultCurrency?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [companyId, setCompanyId] = useState(
    deal?.companyId ?? defaultCompanyId ?? ""
  );
  const [contactId, setContactId] = useState(
    deal?.contactId ?? defaultContactId ?? ""
  );

  const selectedContact = contacts.find((c) => c.id === contactId);
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
    if (c.companyId) setCompanyId(c.companyId);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("companyId", companyId);
    formData.set("contactId", contactId);
    const result = deal
      ? await updateDeal(deal.id, formData)
      : await createDeal(formData);
    setLoading(false);

    if ("error" in result && result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(deal ? "Deal updated" : "Deal created");
    const id = deal?.id ?? ("id" in result ? result.id : undefined);
    if (id) {
      router.push(`/deals/${id}`);
      router.refresh();
    }
  }

  const defaultAmount = deal ? (deal.amountCents / 100).toString() : "0";
  const defaultClose = deal?.expectedCloseAt
    ? new Date(deal.expectedCloseAt).toISOString().slice(0, 10)
    : "";

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required defaultValue={deal?.title} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            min={0}
            step="0.01"
            defaultValue={defaultAmount}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="currency">Currency</Label>
          <Select
            id="currency"
            name="currency"
            defaultValue={deal?.currency ?? defaultCurrency}
          >
            {deal?.currency &&
            !CURRENCIES.some((c) => c.code === deal.currency) ? (
              <option value={deal.currency}>{deal.currency}</option>
            ) : null}
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="stageId">Stage</Label>
          <Select
            id="stageId"
            name="stageId"
            required
            defaultValue={deal?.stageId ?? defaultStageId ?? stages[0]?.id}
          >
            {stages.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="expectedCloseAt">Expected close</Label>
          <Input
            id="expectedCloseAt"
            name="expectedCloseAt"
            type="date"
            defaultValue={defaultClose}
          />
        </div>
      </div>
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
          <Label>Contact</Label>
          <SearchableSelect
            value={contactId}
            onChange={applyContact}
            placeholder={
              companyId
                ? "Search people at this company…"
                : "Type to search contacts…"
            }
            emptyLabel="No contact"
            options={visibleContacts.map((c) => {
              const co = companies.find((x) => x.id === c.companyId);
              return {
                id: c.id,
                label: `${c.firstName} ${c.lastName}`.trim(),
                sublabel:
                  [c.email, c.title, !companyId ? co?.name : null]
                    .filter(Boolean)
                    .join(" · ") || undefined,
                meta: `${c.email ?? ""} ${c.phone ?? ""} ${co?.name ?? ""}`,
              };
            })}
          />
          {companyId ? (
            <p className="text-[11px] text-zinc-400">
              {visibleContacts.length === 0
                ? "No people linked to this company yet"
                : `Showing ${visibleContacts.length} ${
                    visibleContacts.length === 1 ? "person" : "people"
                  } at ${selectedCompany?.name ?? "this company"}`}
            </p>
          ) : (
            <p className="text-[11px] text-zinc-400">
              Pick a company first to narrow contacts, or pick a contact to fill company
            </p>
          )}
        </div>
      </div>
      {selectedContact || selectedCompany ? (
        <div className="rounded-md border border-zinc-100 bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
          {selectedContact ? (
            <p>
              <span className="font-medium text-zinc-800">
                {selectedContact.firstName} {selectedContact.lastName}
              </span>
              {selectedContact.email ? ` · ${selectedContact.email}` : ""}
              {selectedContact.phone ? ` · ${selectedContact.phone}` : ""}
              {selectedContact.title ? ` · ${selectedContact.title}` : ""}
            </p>
          ) : null}
          {selectedCompany ? (
            <p className={selectedContact ? "mt-0.5" : undefined}>
              Company:{" "}
              <span className="font-medium text-zinc-800">
                {selectedCompany.name}
              </span>
              {selectedContact?.companyId === companyId
                ? " (from contact)"
                : ""}
            </p>
          ) : null}
        </div>
      ) : null}
      {members.length > 0 ? (
        <AssigneeSelect
          members={members}
          defaultValue={deal?.ownerId ?? currentUserId ?? ""}
          label="Assigned to"
          allowUnassigned
        />
      ) : null}
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" defaultValue={deal?.notes ?? ""} />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Saving…" : deal ? "Save changes" : "Create deal"}
      </Button>
    </form>
  );
}
