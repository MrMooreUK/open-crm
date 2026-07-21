"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { duplicateQuote, updateQuoteStatus } from "@/lib/actions/quotes";
import { Button } from "@/components/ui/button";

export function QuoteStatusActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();

  async function setStatus(
    next: "draft" | "sent" | "accepted" | "rejected" | "expired"
  ) {
    const result = await updateQuoteStatus(id, next);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(`Marked as ${next.replace("_", " ")}`);
    router.refresh();
  }

  async function onDuplicate() {
    const result = await duplicateQuote(id);
    if ("error" in result && result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Quote duplicated");
    if (result.id) {
      router.push(`/quotes/${result.id}`);
      router.refresh();
    }
  }

  async function copyPrintLink() {
    const url = `${window.location.origin}/quotes/${id}/print`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Print link copied");
    } catch {
      toast.message(url);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status === "draft" ? (
        <Button size="sm" onClick={() => setStatus("sent")}>
          Mark sent
        </Button>
      ) : null}
      {status === "sent" || status === "draft" ? (
        <>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setStatus("accepted")}
          >
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setStatus("rejected")}
          >
            Reject
          </Button>
        </>
      ) : null}
      <Button size="sm" variant="outline" onClick={onDuplicate}>
        Duplicate
      </Button>
      <Button size="sm" variant="ghost" onClick={copyPrintLink}>
        Copy link
      </Button>
    </div>
  );
}
