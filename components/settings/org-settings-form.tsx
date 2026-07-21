"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { updateOrganization } from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function OrgSettingsForm({
  name,
  canEdit,
}: {
  name: string;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canEdit) return;
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateOrganization(formData);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Organization updated");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={name}
          required
          disabled={!canEdit}
        />
      </div>
      {canEdit ? (
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? "Saving…" : "Save"}
        </Button>
      ) : (
        <p className="text-xs text-zinc-500">Only owners can edit settings.</p>
      )}
    </form>
  );
}
