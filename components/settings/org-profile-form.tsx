"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { updateOrganizationProfile } from "@/lib/actions/settings";
import { passwordManagerIgnore } from "@/lib/password-manager";
import { orgPmIgnore } from "@/components/settings/org-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type OrgProfileValues = {
  name: string;
  legalName: string;
  email: string;
  phone: string;
  website: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  taxId: string;
  quoteFooter: string;
};

export function OrgProfileForm({
  values,
  canEdit,
}: {
  values: OrgProfileValues;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canEdit) return;
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateOrganizationProfile(formData);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Company profile saved");
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-3"
      {...passwordManagerIgnore}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="org-display-name">Display name</Label>
          <Input
            id="org-display-name"
            name="name"
            defaultValue={values.name}
            required
            disabled={!canEdit}
            autoComplete="organization"
            data-1p-ignore
            data-lpignore="true"
            data-bwignore
            data-form-type="other"
            data-protonpass-ignore
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="org-legal-name">Legal name</Label>
          <Input
            id="org-legal-name"
            name="legalName"
            defaultValue={values.legalName}
            disabled={!canEdit}
            placeholder="If different from display name"
            autoComplete="organization"
            data-1p-ignore
            data-lpignore="true"
            data-bwignore
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="org-email">Email</Label>
          <Input
            id="org-email"
            name="email"
            type="text"
            inputMode="email"
            defaultValue={values.email}
            disabled={!canEdit}
            placeholder="hello@company.com"
            {...orgPmIgnore}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="org-phone">Phone</Label>
          <Input
            id="org-phone"
            name="phone"
            type="text"
            inputMode="tel"
            defaultValue={values.phone}
            disabled={!canEdit}
            {...orgPmIgnore}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="org-website">Website</Label>
          <Input
            id="org-website"
            name="website"
            type="text"
            inputMode="url"
            defaultValue={values.website}
            disabled={!canEdit}
            placeholder="https://"
            {...orgPmIgnore}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="org-address-line1">Address line 1</Label>
          <Input
            id="org-address-line1"
            name="addressLine1"
            defaultValue={values.addressLine1}
            disabled={!canEdit}
            {...orgPmIgnore}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="org-address-line2">Address line 2</Label>
          <Input
            id="org-address-line2"
            name="addressLine2"
            defaultValue={values.addressLine2}
            disabled={!canEdit}
            {...orgPmIgnore}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="org-city">City</Label>
          <Input
            id="org-city"
            name="city"
            defaultValue={values.city}
            disabled={!canEdit}
            {...orgPmIgnore}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="org-region">State / region</Label>
          <Input
            id="org-region"
            name="region"
            defaultValue={values.region}
            disabled={!canEdit}
            {...orgPmIgnore}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="org-postal-code">Postal code</Label>
          <Input
            id="org-postal-code"
            name="postalCode"
            defaultValue={values.postalCode}
            disabled={!canEdit}
            {...orgPmIgnore}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="org-country">Country</Label>
          <Input
            id="org-country"
            name="country"
            defaultValue={values.country}
            disabled={!canEdit}
            {...orgPmIgnore}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="org-tax-id">Tax / VAT ID</Label>
          <Input
            id="org-tax-id"
            name="taxId"
            defaultValue={values.taxId}
            disabled={!canEdit}
            placeholder="Shown on quotes"
            {...orgPmIgnore}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="org-quote-footer">Quote footer</Label>
          <Textarea
            id="org-quote-footer"
            name="quoteFooter"
            rows={3}
            defaultValue={values.quoteFooter}
            disabled={!canEdit}
            placeholder="Thank you for your business. Bank details: …"
            {...orgPmIgnore}
          />
          <p className="text-[11px] text-zinc-400">
            Optional text at the bottom of printed quotes
          </p>
        </div>
      </div>

      {canEdit ? (
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? "Saving…" : "Save profile"}
        </Button>
      ) : (
        <p className="text-xs text-zinc-500">Only owners can edit settings.</p>
      )}
    </form>
  );
}
