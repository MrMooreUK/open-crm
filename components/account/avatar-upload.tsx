"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { removeAvatar, uploadAvatar } from "@/lib/actions/account";
import { userAvatarSrc } from "@/lib/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2, Upload } from "lucide-react";

export function AvatarUpload({
  imageUrl,
  userName,
}: {
  imageUrl: string | null;
  userName: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const displayUrl = preview || userAvatarSrc(imageUrl);
  const hasCustom = Boolean(preview || imageUrl);

  async function onFile(file: File | null) {
    if (!file) return;
    setLoading(true);

    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result));
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.set("avatar", file);
    const result = await uploadAvatar(formData);
    setLoading(false);

    if ("error" in result && result.error) {
      toast.error(result.error);
      setPreview(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    toast.success("Photo updated");
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
    router.refresh();
  }

  async function onRemove() {
    if (!imageUrl) return;
    if (!confirm("Remove your profile photo?")) return;
    setLoading(true);
    const result = await removeAvatar();
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Photo removed");
    setPreview(null);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div>
        <Label>Profile photo</Label>
        <p className="mt-0.5 text-xs text-zinc-400">
          PNG, JPEG, or WebP · max 2 MB. Default image used when empty.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-zinc-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayUrl}
            alt={`${userName} profile photo`}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="h-3.5 w-3.5" />
            {loading
              ? "Uploading…"
              : hasCustom
                ? "Replace photo"
                : "Upload photo"}
          </Button>
          {imageUrl ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={loading}
              onClick={onRemove}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
