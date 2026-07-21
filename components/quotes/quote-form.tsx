"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { createQuote, updateQuote } from "@/lib/actions/quotes";
import {
  contactBelongsToCompany,
  filterContactsByCompany,
} from "@/lib/crm-links";
import { CURRENCIES } from "@/lib/settings-options";
import {
  DEFAULT_QUOTE_TERMS,
  TAX_PRESETS,
  VALID_UNTIL_PRESETS,
  addDaysISO,
  endOfMonthISO,
} from "@/lib/quotes/defaults";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { formatCurrency } from "@/lib/utils";
import { Copy, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

type Line = {
  description: string;
  quantity: string;
  unitPrice: string;
};

export type ServiceOpt = {
  id: string;
  name: string;
  description: string | null;
  unitPriceCents: number;
  unit: string;
  currency: string;
};

type Quote = {
  id: string;
  title: string;
  status: string;
  currency: string;
  taxBps: number;
  validUntil: Date | null;
  notes: string | null;
  terms: string | null;
  enquiryId: string | null;
  dealId: string | null;
  companyId: string | null;
  contactId: string | null;
  billToName: string | null;
  billToEmail: string | null;
  billToCompany: string | null;
  billToAddress: string | null;
  items: {
    description: string;
    quantityMillis: number;
    unitPriceCents: number;
  }[];
};

type ContactOpt = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone?: string | null;
  title?: string | null;
  companyId?: string | null;
};

export function QuoteForm({
  quote,
  companies,
  contacts,
  enquiries,
  deals,
  services = [],
  defaultCurrency = "USD",
  defaultEnquiryId,
  defaultDealId,
  defaultCompanyId,
  defaultContactId,
  defaultBillTo,
  defaultTitle,
}: {
  quote?: Quote;
  companies: { id: string; name: string }[];
  contacts: ContactOpt[];
  enquiries: { id: string; title: string }[];
  deals: { id: string; title: string }[];
  services?: ServiceOpt[];
  defaultCurrency?: string;
  defaultEnquiryId?: string;
  defaultDealId?: string;
  defaultCompanyId?: string;
  defaultContactId?: string;
  defaultBillTo?: {
    name?: string;
    email?: string;
    company?: string;
  };
  defaultTitle?: string;
}) {
  const router = useRouter();
  const isNew = !quote;
  const [loading, setLoading] = useState(false);
  const afterActionRef = useRef<"view" | "print" | "sent">("view");
  const [enquiryId, setEnquiryId] = useState(
    quote?.enquiryId ?? defaultEnquiryId ?? ""
  );
  const [dealId, setDealId] = useState(quote?.dealId ?? defaultDealId ?? "");

  const [lines, setLines] = useState<Line[]>(
    quote?.items.length
      ? quote.items.map((i) => ({
          description: i.description,
          quantity: String(i.quantityMillis / 1000),
          unitPrice: (i.unitPriceCents / 100).toFixed(2),
        }))
      : [{ description: "", quantity: "1", unitPrice: "" }]
  );
  const [taxPercent, setTaxPercent] = useState(
    quote ? String(quote.taxBps / 100) : "0"
  );
  const [currency, setCurrency] = useState(
    quote?.currency ?? defaultCurrency
  );
  const [validUntil, setValidUntil] = useState(
    quote?.validUntil
      ? new Date(quote.validUntil).toISOString().slice(0, 10)
      : addDaysISO(30)
  );
  const [terms, setTerms] = useState(
    quote?.terms ?? (isNew ? DEFAULT_QUOTE_TERMS : "")
  );
  const [notes, setNotes] = useState(quote?.notes ?? "");
  const [companyId, setCompanyId] = useState(
    quote?.companyId ?? defaultCompanyId ?? ""
  );
  const [contactId, setContactId] = useState(
    quote?.contactId ?? defaultContactId ?? ""
  );
  const [billToName, setBillToName] = useState(
    quote?.billToName ?? defaultBillTo?.name ?? ""
  );
  const [billToEmail, setBillToEmail] = useState(
    quote?.billToEmail ?? defaultBillTo?.email ?? ""
  );
  const [billToCompany, setBillToCompany] = useState(
    quote?.billToCompany ?? defaultBillTo?.company ?? ""
  );
  const [billToAddress, setBillToAddress] = useState(
    quote?.billToAddress ?? ""
  );
  const [title, setTitle] = useState(
    quote?.title ?? defaultTitle ?? ""
  );

  const totals = useMemo(() => {
    const subtotal = lines.reduce((sum, l) => {
      const q = Number(l.quantity) || 0;
      const p = Number(l.unitPrice) || 0;
      return sum + q * p;
    }, 0);
    const tax = subtotal * ((Number(taxPercent) || 0) / 100);
    return {
      subtotalCents: Math.round(subtotal * 100),
      taxCents: Math.round(tax * 100),
      totalCents: Math.round((subtotal + tax) * 100),
    };
  }, [lines, taxPercent]);

  function updateLine(index: number, patch: Partial<Line>) {
    setLines((prev) =>
      prev.map((l, i) => (i === index ? { ...l, ...patch } : l))
    );
  }

  function addLine(seed?: Partial<Line>) {
    setLines((prev) => [
      ...prev,
      {
        description: seed?.description ?? "",
        quantity: seed?.quantity ?? "1",
        unitPrice: seed?.unitPrice ?? "",
      },
    ]);
  }

  function duplicateLine(index: number) {
    setLines((prev) => {
      const copy = { ...prev[index] };
      const next = [...prev];
      next.splice(index + 1, 0, copy);
      return next;
    });
  }

  function removeLine(index: number) {
    setLines((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)
    );
  }

  function applyContact(id: string) {
    setContactId(id);
    if (!id) return;
    const c = contacts.find((x) => x.id === id);
    if (!c) return;
    const name = `${c.firstName} ${c.lastName}`.trim();
    if (name) setBillToName(name);
    if (c.email) setBillToEmail(c.email);
    if (c.companyId) {
      const co = companies.find((x) => x.id === c.companyId);
      if (co) {
        setCompanyId(co.id);
        setBillToCompany(co.name);
      }
    }
    // Soft note in address if title present and address empty
    if (c.title && !billToAddress) {
      // leave address alone; surface title in notes hint only via bill company context
    }
  }

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
    if (!id) return;
    const co = companies.find((x) => x.id === id);
    if (co) setBillToCompany(co.name);
  }

  const selectedContact = contacts.find((c) => c.id === contactId);
  const selectedCompany = companies.find((c) => c.id === companyId);
  const visibleContacts = useMemo(
    () => filterContactsByCompany(contacts, companyId),
    [contacts, companyId]
  );

  function applyEnquiry(id: string) {
    setEnquiryId(id);
    if (!id) return;
    const e = enquiries.find((x) => x.id === id);
    if (e && !title) setTitle(e.title);
  }

  function addService(serviceId: string) {
    if (!serviceId) return;
    const s = services.find((x) => x.id === serviceId);
    if (!s) return;
    const unitHint =
      s.unit === "hour"
        ? " (hourly)"
        : s.unit === "day"
          ? " (daily)"
          : s.unit === "month"
            ? " (monthly)"
            : s.unit === "project"
              ? " (project)"
              : "";
    addLine({
      description: s.description?.trim() || `${s.name}${unitHint}`,
      quantity: "1",
      unitPrice: (s.unitPriceCents / 100).toFixed(2),
    });
    if (s.currency && s.currency !== currency) {
      setCurrency(s.currency);
    }
    toast.success(`Added ${s.name}`);
  }

  const unitLabel = (unit: string) => {
    switch (unit) {
      case "hour":
        return "/hr";
      case "day":
        return "/day";
      case "month":
        return "/mo";
      case "project":
        return "/project";
      default:
        return "";
    }
  };

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const action = afterActionRef.current;
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    formData.delete("lineDescription");
    formData.delete("lineQuantity");
    formData.delete("lineUnitPrice");
    for (const line of lines) {
      formData.append("lineDescription", line.description);
      formData.append("lineQuantity", line.quantity || "1");
      formData.append("lineUnitPrice", line.unitPrice || "0");
    }
    formData.set("taxPercent", taxPercent);
    formData.set("currency", currency);
    formData.set("validUntil", validUntil);
    formData.set("terms", terms);
    formData.set("notes", notes);
    formData.set("title", title);
    formData.set("enquiryId", enquiryId);
    formData.set("dealId", dealId);
    formData.set("companyId", companyId);
    formData.set("contactId", contactId);
    formData.set("billToName", billToName);
    formData.set("billToEmail", billToEmail);
    formData.set("billToCompany", billToCompany);
    formData.set("billToAddress", billToAddress);
    if (action === "sent") {
      formData.set("status", "sent");
    }

    const result = quote
      ? await updateQuote(quote.id, formData)
      : await createQuote(formData);
    setLoading(false);

    if ("error" in result && result.error) {
      toast.error(result.error);
      return;
    }

    const id = quote?.id ?? ("id" in result ? result.id : undefined);
    toast.success(
      action === "sent"
        ? "Quote saved & marked sent"
        : quote
          ? "Quote updated"
          : "Quote created"
    );

    if (!id) return;

    if (action === "print") {
      router.push(`/quotes/${id}/print`);
      router.refresh();
      return;
    }
    router.push(`/quotes/${id}`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="title">Quote title</Label>
          <Input
            id="title"
            name="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Website redesign proposal"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <Select
            id="status"
            name="status"
            defaultValue={quote?.status ?? "draft"}
          >
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
          </Select>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="validUntil">Valid until</Label>
            <span className="text-[11px] text-zinc-400">
              defaults to 30 days
            </span>
          </div>
          <Input
            id="validUntil"
            name="validUntil"
            type="date"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
          />
          <div className="flex flex-wrap gap-1 pt-1">
            {VALID_UNTIL_PRESETS.map((p) => (
              <button
                key={p.days}
                type="button"
                onClick={() => setValidUntil(addDaysISO(p.days))}
                className="rounded-md border border-zinc-200 bg-white px-2 py-0.5 text-[11px] font-medium text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
              >
                +{p.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setValidUntil(endOfMonthISO())}
              className="rounded-md border border-zinc-200 bg-white px-2 py-0.5 text-[11px] font-medium text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
            >
              End of month
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Enquiry</Label>
          <SearchableSelect
            name="enquiryId"
            value={enquiryId}
            onChange={applyEnquiry}
            placeholder="Type to search enquiries…"
            emptyLabel="No enquiry"
            options={enquiries.map((e) => ({
              id: e.id,
              label: e.title,
            }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Deal</Label>
          <SearchableSelect
            name="dealId"
            value={dealId}
            onChange={setDealId}
            placeholder="Type to search deals…"
            emptyLabel="No deal"
            options={deals.map((d) => ({
              id: d.id,
              label: d.title,
            }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Company</Label>
          <SearchableSelect
            name="companyId"
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
            name="contactId"
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
                  [
                    c.email,
                    c.title,
                    c.phone,
                    !companyId ? co?.name : null,
                  ]
                    .filter(Boolean)
                    .join(" · ") || undefined,
                meta: `${c.email ?? ""} ${c.phone ?? ""} ${c.title ?? ""} ${co?.name ?? ""}`,
              };
            })}
          />
          <p className="text-[11px] text-zinc-400">
            {companyId
              ? visibleContacts.length === 0
                ? "No people linked to this company yet"
                : `Showing people at ${selectedCompany?.name ?? "this company"} · fills bill-to`
              : "Pick a company to narrow contacts · contact fills bill-to + company"}
          </p>
        </div>
      </div>

      {selectedContact || selectedCompany ? (
        <div className="rounded-md border border-emerald-100 bg-emerald-50/50 px-3 py-2 text-xs text-zinc-700">
          <p className="font-medium text-zinc-800">Pulled through</p>
          {selectedContact ? (
            <p className="mt-0.5">
              {selectedContact.firstName} {selectedContact.lastName}
              {selectedContact.email ? ` · ${selectedContact.email}` : ""}
              {selectedContact.phone ? ` · ${selectedContact.phone}` : ""}
              {selectedContact.title ? ` · ${selectedContact.title}` : ""}
            </p>
          ) : null}
          {selectedCompany ? (
            <p className="mt-0.5">Company: {selectedCompany.name}</p>
          ) : null}
        </div>
      ) : null}

      <fieldset className="space-y-3 rounded-lg border border-zinc-200 p-3">
        <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Bill to
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="billToName">Name</Label>
            <Input
              id="billToName"
              name="billToName"
              value={billToName}
              onChange={(e) => setBillToName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="billToEmail">Email</Label>
            <Input
              id="billToEmail"
              name="billToEmail"
              type="email"
              value={billToEmail}
              onChange={(e) => setBillToEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="billToCompany">Company</Label>
            <Input
              id="billToCompany"
              name="billToCompany"
              value={billToCompany}
              onChange={(e) => setBillToCompany(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="billToAddress">Address</Label>
            <Input
              id="billToAddress"
              name="billToAddress"
              value={billToAddress}
              onChange={(e) => setBillToAddress(e.target.value)}
              placeholder="Street, city, postcode"
            />
          </div>
        </div>
      </fieldset>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label>Line items</Label>
          <button
            type="button"
            onClick={() => addLine()}
            className="inline-flex items-center gap-1 text-xs font-medium text-zinc-600 hover:text-zinc-900"
          >
            <Plus className="h-3 w-3" />
            Blank line
          </button>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-zinc-50/60 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Add from services
            </p>
            <Link
              href="/services"
              className="text-[11px] font-medium text-zinc-500 hover:text-zinc-900"
            >
              Manage services
            </Link>
          </div>
          {services.length === 0 ? (
            <p className="text-xs text-zinc-500">
              No services yet.{" "}
              <Link href="/services" className="underline underline-offset-2">
                Create services with rates
              </Link>{" "}
              to add priced lines in one click.
            </p>
          ) : (
            <SearchableSelect
              value=""
              onChange={(id) => {
                if (id) addService(id);
              }}
              allowEmpty={false}
              placeholder="Search services to add…"
              options={services.map((s) => ({
                id: s.id,
                label: s.name,
                sublabel: `${formatCurrency(s.unitPriceCents, s.currency)}${unitLabel(s.unit)}`,
                meta: `${s.description ?? ""} ${s.unit}`,
              }))}
            />
          )}
          {services.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1">
              {services.slice(0, 6).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => addService(s.id)}
                  className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-[11px] font-medium text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
                >
                  + {s.name}
                  <span className="ml-1 text-zinc-400">
                    {formatCurrency(s.unitPriceCents, s.currency)}
                    {unitLabel(s.unit)}
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="hidden text-[11px] font-medium uppercase tracking-wide text-zinc-400 sm:grid sm:grid-cols-[1fr_72px_96px_88px_auto] sm:gap-2 sm:px-2">
          <span>Description</span>
          <span>Qty</span>
          <span>Unit price</span>
          <span className="text-right">Line total</span>
          <span />
        </div>

        <div className="space-y-2">
          {lines.map((line, i) => {
            const lineTotal =
              (Number(line.quantity) || 0) * (Number(line.unitPrice) || 0);
            return (
              <div
                key={i}
                className="grid gap-2 rounded-md border border-zinc-100 bg-zinc-50/50 p-2 sm:grid-cols-[1fr_72px_96px_88px_auto] sm:items-center"
              >
                <Input
                  placeholder="Description"
                  value={line.description}
                  onChange={(e) =>
                    updateLine(i, { description: e.target.value })
                  }
                  required
                />
                <Input
                  type="number"
                  min={0}
                  step="0.001"
                  placeholder="Qty"
                  value={line.quantity}
                  onChange={(e) => updateLine(i, { quantity: e.target.value })}
                  aria-label="Quantity"
                />
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  value={line.unitPrice}
                  onChange={(e) =>
                    updateLine(i, { unitPrice: e.target.value })
                  }
                  aria-label="Unit price"
                />
                <div className="px-1 text-right text-sm font-medium text-zinc-700">
                  {formatCurrency(Math.round(lineTotal * 100), currency)}
                </div>
                <div className="flex gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    title="Duplicate line"
                    onClick={() => duplicateLine(i)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    title="Remove line"
                    onClick={() => removeLine(i)}
                    disabled={lines.length <= 1}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="currency">Currency</Label>
          <Select
            id="currency"
            name="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="taxPercent">Tax %</Label>
          <Input
            id="taxPercent"
            name="taxPercent"
            type="number"
            min={0}
            max={100}
            step="0.01"
            value={taxPercent}
            onChange={(e) => setTaxPercent(e.target.value)}
          />
          <div className="flex flex-wrap gap-1">
            {TAX_PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setTaxPercent(p.value)}
                className="rounded-md border border-zinc-200 bg-white px-2 py-0.5 text-[11px] font-medium text-zinc-600 hover:bg-zinc-50"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-end rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm">
          <div className="flex justify-between text-zinc-500">
            <span>Subtotal</span>
            <span>{formatCurrency(totals.subtotalCents, currency)}</span>
          </div>
          <div className="flex justify-between text-zinc-500">
            <span>Tax</span>
            <span>{formatCurrency(totals.taxCents, currency)}</span>
          </div>
          <div className="mt-1 flex justify-between border-t border-zinc-100 pt-1 text-base font-semibold text-zinc-900">
            <span>Total</span>
            <span>{formatCurrency(totals.totalCents, currency)}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="notes">Notes (customer-facing)</Label>
          <Textarea
            id="notes"
            name="notes"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional message for the customer…"
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="terms">Terms</Label>
            <button
              type="button"
              className="text-[11px] font-medium text-zinc-500 hover:text-zinc-900"
              onClick={() => setTerms(DEFAULT_QUOTE_TERMS)}
            >
              Insert defaults
            </button>
          </div>
          <Textarea
            id="terms"
            name="terms"
            rows={4}
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            placeholder="Payment due within 30 days…"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-4">
        <Button
          type="submit"
          disabled={loading}
          onClick={() => {
            afterActionRef.current = "view";
          }}
        >
          {loading ? "Saving…" : quote ? "Save quote" : "Create quote"}
        </Button>
        <Button
          type="submit"
          variant="secondary"
          disabled={loading}
          onClick={() => {
            afterActionRef.current = "print";
          }}
        >
          Save & print
        </Button>
        <Button
          type="submit"
          variant="outline"
          disabled={loading}
          onClick={() => {
            afterActionRef.current = "sent";
          }}
        >
          Save & mark sent
        </Button>
      </div>
    </form>
  );
}
