"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteDeal } from "@/lib/actions/deals";
import { Button } from "@/components/ui/button";

export function DeleteDealButton({ id }: { id: string }) {
  const router = useRouter();

  async function onDelete() {
    if (!confirm("Delete this deal?")) return;
    await deleteDeal(id);
    toast.success("Deal deleted");
    router.push("/deals");
    router.refresh();
  }

  return (
    <Button variant="outline" size="sm" onClick={onDelete}>
      Delete
    </Button>
  );
}
