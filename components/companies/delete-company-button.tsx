"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteCompany } from "@/lib/actions/companies";
import { Button } from "@/components/ui/button";

export function DeleteCompanyButton({ id }: { id: string }) {
  const router = useRouter();

  async function onDelete() {
    if (!confirm("Delete this company?")) return;
    await deleteCompany(id);
    toast.success("Company deleted");
    router.push("/companies");
    router.refresh();
  }

  return (
    <Button variant="outline" size="sm" onClick={onDelete}>
      Delete
    </Button>
  );
}
