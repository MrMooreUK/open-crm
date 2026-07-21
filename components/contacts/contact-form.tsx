"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { createContact, updateContact } from "@/lib/actions/contacts";
import {
  CompanyPicker,
  type CompanyOption,
} from "@/components/contacts/company-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fullName } from "@/lib/utils";

type Contact = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  title: string | null;
  companyId: string | null;
  notes: string | null;
};

export function ContactForm({
  contact,
  companies,
  defaultCompanyId,
  compact,
}: {
  contact?: Contact;
  companies: CompanyOption[];
  defaultCompanyId?: string;
  /** Hide notes for create-only simple mode */
  compact?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [companyId, setCompanyId] = useState(
    contact?.companyId ?? defaultCompanyId ?? ""
  );
  const [companyName, setCompanyName] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("companyId", companyId);
    formData.set("companyName", companyName);

    const result = contact
      ? await updateContact(contact.id, formData)
      : await createContact(formData);

    setLoading(false);

    if ("error" in result && result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(contact ? "Contact updated" : "Contact created");
    const id = contact?.id ?? ("id" in result ? result.id : undefined);
    if (id) {
      router.push(`/contacts/${id}`);
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          required
          autoFocus={!contact}
          placeholder="Jane Smith"
          defaultValue={
            contact ? fullName(contact.firstName, contact.lastName) : ""
          }
          autoComplete="name"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="jane@acme.com"
          defaultValue={contact?.email ?? ""}
          autoComplete="email"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Company</Label>
        <CompanyPicker
          companies={companies}
          value={companyId}
          companyName={companyName}
          onChange={({ companyId: id, companyName: name }) => {
            setCompanyId(id);
            setCompanyName(name);
          }}
        />
        <p className="text-[11px] text-zinc-400">
          Search existing, or type a new name to create the company
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            placeholder="VP Sales"
            defaultValue={contact?.title ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={contact?.phone ?? ""}
          />
        </div>
      </div>

      {!compact ? (
        <div className="space-y-1.5">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            defaultValue={contact?.notes ?? ""}
            rows={3}
          />
        </div>
      ) : null}

      <Button type="submit" disabled={loading}>
        {loading ? "Saving…" : contact ? "Save changes" : "Create contact"}
      </Button>
    </form>
  );
}
