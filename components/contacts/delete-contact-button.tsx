"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteContact } from "@/lib/actions/contacts";
import { Button } from "@/components/ui/button";

export function DeleteContactButton({ id }: { id: string }) {
  const router = useRouter();

  async function onDelete() {
    if (!confirm("Delete this contact?")) return;
    await deleteContact(id);
    toast.success("Contact deleted");
    router.push("/contacts");
    router.refresh();
  }

  return (
    <Button variant="outline" size="sm" onClick={onDelete}>
      Delete
    </Button>
  );
}
