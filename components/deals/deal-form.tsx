"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { createDeal, updateDeal } from "@/lib/actions/deals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

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
};

export function DealForm({
  deal,
  stages,
  companies,
  contacts,
  defaultCompanyId,
  defaultStageId,
}: {
  deal?: Deal;
  stages: { id: string; name: string }[];
  companies: { id: string; name: string }[];
  contacts: { id: string; firstName: string; lastName: string }[];
  defaultCompanyId?: string;
  defaultStageId?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
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
            defaultValue={deal?.currency ?? "USD"}
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
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
          <Label htmlFor="companyId">Company</Label>
          <Select
            id="companyId"
            name="companyId"
            defaultValue={deal?.companyId ?? defaultCompanyId ?? ""}
          >
            <option value="">No company</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contactId">Contact</Label>
          <Select
            id="contactId"
            name="contactId"
            defaultValue={deal?.contactId ?? ""}
          >
            <option value="">No contact</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName}
              </option>
            ))}
          </Select>
        </div>
      </div>
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
