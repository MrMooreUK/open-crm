"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { createContact, updateContact } from "@/lib/actions/contacts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

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
}: {
  contact?: Contact;
  companies: { id: string; name: string }[];
  defaultCompanyId?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
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
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="firstName">First name</Label>
          <Input
            id="firstName"
            name="firstName"
            required
            defaultValue={contact?.firstName}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastName">Last name</Label>
          <Input
            id="lastName"
            name="lastName"
            defaultValue={contact?.lastName ?? ""}
          />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={contact?.email ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" defaultValue={contact?.phone ?? ""} />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" defaultValue={contact?.title ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="companyId">Company</Label>
          <Select
            id="companyId"
            name="companyId"
            defaultValue={
              contact?.companyId ?? defaultCompanyId ?? ""
            }
          >
            <option value="">No company</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" defaultValue={contact?.notes ?? ""} />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Saving…" : contact ? "Save changes" : "Create contact"}
      </Button>
    </form>
  );
}
