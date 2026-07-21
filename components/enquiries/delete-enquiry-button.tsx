"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteEnquiry } from "@/lib/actions/enquiries";
import { Button } from "@/components/ui/button";

export function DeleteEnquiryButton({ id }: { id: string }) {
  const router = useRouter();

  async function onDelete() {
    if (!confirm("Delete this enquiry?")) return;
    await deleteEnquiry(id);
    toast.success("Enquiry deleted");
    router.push("/enquiries");
    router.refresh();
  }

  return (
    <Button variant="outline" size="sm" onClick={onDelete}>
      Delete
    </Button>
  );
}
