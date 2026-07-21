"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { createInvite } from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { passwordManagerIgnore } from "@/lib/password-manager";

export function InviteForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const result = await createInvite(formData);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    if (result.inviteUrl) {
      const full = `${window.location.origin}${result.inviteUrl}`;
      setInviteUrl(full);
      await navigator.clipboard.writeText(full).catch(() => undefined);
      toast.success("Invite created — link copied");
    }
    form.reset();
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <form
        onSubmit={onSubmit}
        className="flex flex-wrap items-end gap-2"
        {...passwordManagerIgnore}
      >
        <div className="min-w-[200px] flex-1 space-y-1.5">
          <Label htmlFor="invite-email">Email</Label>
          <Input
            id="invite-email"
            name="email"
            type="text"
            inputMode="email"
            required
            placeholder="teammate@company.com"
            autoComplete="off"
            data-1p-ignore
            data-lpignore="true"
            data-bwignore
            data-form-type="other"
            data-protonpass-ignore
          />
        </div>
        <div className="w-28 space-y-1.5">
          <Label htmlFor="invite-role">Role</Label>
          <Select id="invite-role" name="role" defaultValue="member">
            <option value="member">Member</option>
            <option value="owner">Owner</option>
          </Select>
        </div>
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? "…" : "Invite"}
        </Button>
      </form>
      {inviteUrl ? (
        <p className="break-all rounded-md bg-zinc-50 px-2 py-1.5 text-xs text-zinc-600">
          {inviteUrl}
        </p>
      ) : null}
    </div>
  );
}
