"use client";

import { useState } from "react";
import { QuickAddContact } from "@/components/contacts/quick-add-contact";
import type { CompanyOption } from "@/components/contacts/company-picker";

export function CompanyQuickAddContact({
  companyId,
  companyName,
  companies,
}: {
  companyId: string;
  companyName: string;
  companies: CompanyOption[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-medium text-zinc-600 hover:text-zinc-900"
      >
        Add contact
      </button>
      <QuickAddContact
        companies={companies}
        defaultCompanyId={companyId}
        defaultCompanyName={companyName}
        lockCompany
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
