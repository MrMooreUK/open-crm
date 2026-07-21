"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { createContact } from "@/lib/actions/contacts";
import {
  CompanyPicker,
  type CompanyOption,
} from "@/components/contacts/company-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  companies: CompanyOption[];
  defaultCompanyId?: string;
  defaultCompanyName?: string;
  lockCompany?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function QuickAddContactDialog({
  companies,
  defaultCompanyId,
  defaultCompanyName,
  lockCompany,
  onOpenChange,
}: Omit<Props, "open">) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [companyId, setCompanyId] = useState(defaultCompanyId ?? "");
  const [companyName, setCompanyName] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [formKey, setFormKey] = useState(0);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("companyId", companyId);
    formData.set("companyName", companyName);

    const result = await createContact(formData);
    setLoading(false);

    if ("error" in result && result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Contact added");
    onOpenChange(false);
    setFormKey((k) => k + 1);
    setCompanyId(defaultCompanyId ?? "");
    setCompanyName("");
    setShowMore(false);
    router.refresh();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 p-4 pt-[12vh]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onOpenChange(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onOpenChange(false);
      }}
    >
      <div
        className="w-full max-w-md rounded-lg border border-zinc-200 bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-add-contact-title"
      >
        <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
          <h2
            id="quick-add-contact-title"
            className="text-sm font-semibold text-zinc-900"
          >
            Add contact
          </h2>
          <button
            type="button"
            className="text-xs text-zinc-500 hover:text-zinc-900"
            onClick={() => onOpenChange(false)}
          >
            Esc
          </button>
        </div>

        <form key={formKey} onSubmit={onSubmit} className="space-y-3 p-4">
          <div className="space-y-1.5">
            <Label htmlFor="qa-name">Name</Label>
            <Input
              id="qa-name"
              name="name"
              required
              autoFocus
              placeholder="Jane Smith"
              autoComplete="name"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="qa-email">Email</Label>
            <Input
              id="qa-email"
              name="email"
              type="email"
              placeholder="jane@acme.com"
              autoComplete="email"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Company</Label>
            {lockCompany && defaultCompanyId ? (
              <div className="flex h-9 items-center rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-700">
                {defaultCompanyName ?? "Selected company"}
                <input
                  type="hidden"
                  name="companyId"
                  value={defaultCompanyId}
                />
              </div>
            ) : (
              <CompanyPicker
                companies={companies}
                value={companyId}
                companyName={companyName}
                onChange={({ companyId: id, companyName: name }) => {
                  setCompanyId(id);
                  setCompanyName(name);
                }}
                placeholder="Type to find or create…"
              />
            )}
          </div>

          {showMore ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="qa-title">Title</Label>
                <Input id="qa-title" name="title" placeholder="VP Sales" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="qa-phone">Phone</Label>
                <Input id="qa-phone" name="phone" type="tel" />
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="text-xs font-medium text-zinc-500 hover:text-zinc-900"
              onClick={() => setShowMore(true)}
            >
              + Title & phone
            </button>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "Adding…" : "Add contact"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function QuickAddContact(props: Props) {
  if (!props.open) return null;
  // Remount dialog each open so company state resets cleanly
  return <QuickAddContactDialog key="open" {...props} />;
}

export function QuickAddContactButton({
  companies,
  defaultCompanyId,
  defaultCompanyName,
  lockCompany,
  label = "New contact",
}: {
  companies: CompanyOption[];
  defaultCompanyId?: string;
  defaultCompanyName?: string;
  lockCompany?: boolean;
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-primary"
      >
        {label}
      </button>
      <QuickAddContact
        companies={companies}
        defaultCompanyId={defaultCompanyId}
        defaultCompanyName={defaultCompanyName}
        lockCompany={lockCompany}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
