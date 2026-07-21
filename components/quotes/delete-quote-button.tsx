"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteQuote } from "@/lib/actions/quotes";
import { Button } from "@/components/ui/button";

export function DeleteQuoteButton({ id }: { id: string }) {
  const router = useRouter();

  async function onDelete() {
    if (!confirm("Delete this quote?")) return;
    await deleteQuote(id);
    toast.success("Quote deleted");
    router.push("/quotes");
    router.refresh();
  }

  return (
    <Button variant="outline" size="sm" onClick={onDelete}>
      Delete
    </Button>
  );
}
