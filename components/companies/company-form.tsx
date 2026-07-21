"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { createCompany, updateCompany } from "@/lib/actions/companies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Company = {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  website: string | null;
  notes: string | null;
};

export function CompanyForm({
  company,
  onSuccess,
}: {
  company?: Company;
  onSuccess?: (id: string) => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    const result = company
      ? await updateCompany(company.id, formData)
      : await createCompany(formData);

    setLoading(false);

    if ("error" in result && result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(company ? "Company updated" : "Company created");
    const id = company?.id ?? ("id" in result ? result.id : undefined);
    if (id) {
      onSuccess?.(id);
      router.push(`/companies/${id}`);
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required defaultValue={company?.name} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="domain">Domain</Label>
          <Input
            id="domain"
            name="domain"
            placeholder="acme.com"
            defaultValue={company?.domain ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="industry">Industry</Label>
          <Input
            id="industry"
            name="industry"
            defaultValue={company?.industry ?? ""}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          name="website"
          placeholder="https://"
          defaultValue={company?.website ?? ""}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" defaultValue={company?.notes ?? ""} />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Saving…" : company ? "Save changes" : "Create company"}
      </Button>
    </form>
  );
}
