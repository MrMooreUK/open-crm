"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { redeemInvite } from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";

export function AcceptInviteButton({ token }: { token: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onAccept() {
    setLoading(true);
    const result = await redeemInvite(token);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Joined workspace");
    router.push("/");
    router.refresh();
  }

  return (
    <Button className="w-full" onClick={onAccept} disabled={loading}>
      {loading ? "Joining…" : "Accept invite"}
    </Button>
  );
}
