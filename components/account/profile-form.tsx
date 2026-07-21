"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { updateProfile } from "@/lib/actions/account";
import { passwordManagerIgnore } from "@/lib/password-manager";
import { AvatarUpload } from "@/components/account/avatar-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfileForm({
  name,
  email,
  image,
}: {
  name: string;
  email: string;
  image: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateProfile(formData);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Profile saved");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <AvatarUpload imageUrl={image} userName={name} />

      <form
        onSubmit={onSubmit}
        className="space-y-3"
        {...passwordManagerIgnore}
      >
        <div className="space-y-1.5">
          <Label htmlFor="user-name">Display name</Label>
          <Input
            id="user-name"
            name="name"
            required
            defaultValue={name}
            autoComplete="name"
            maxLength={100}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="user-email">Email</Label>
          <Input
            id="user-email"
            name="email"
            type="email"
            required
            defaultValue={email}
            autoComplete="email"
          />
          <p className="text-[11px] text-zinc-400">
            Used to sign in. Changing it will mark the address as unverified.
          </p>
        </div>
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? "Saving…" : "Save profile"}
        </Button>
      </form>
    </div>
  );
}
