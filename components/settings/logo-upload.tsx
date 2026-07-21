"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  removeOrganizationLogo,
  uploadOrganizationLogo,
} from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ImageIcon, Trash2, Upload } from "lucide-react";

export function LogoUpload({
  logoUrl,
  canEdit,
  orgName,
}: {
  logoUrl: string | null;
  canEdit: boolean;
  orgName: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const displayUrl = preview || logoUrl;

  async function onFile(file: File | null) {
    if (!file || !canEdit) return;
    setLoading(true);
    // local preview
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result));
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.set("logo", file);
    const result = await uploadOrganizationLogo(formData);
    setLoading(false);

    if ("error" in result && result.error) {
      toast.error(result.error);
      setPreview(null);
      return;
    }

    toast.success("Logo uploaded");
    setPreview(null);
    router.refresh();
  }

  async function onRemove() {
    if (!canEdit) return;
    if (!confirm("Remove organization logo?")) return;
    setLoading(true);
    const result = await removeOrganizationLogo();
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Logo removed");
    setPreview(null);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div>
        <Label>Logo</Label>
        <p className="mt-0.5 text-xs text-zinc-400">
          Shown on quotes and documents. PNG, JPEG, WebP, or SVG · max 2 MB
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
          {displayUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={displayUrl}
              alt={`${orgName} logo`}
              className="max-h-full max-w-full object-contain p-1"
            />
          ) : (
            <ImageIcon className="h-8 w-8 text-zinc-300" />
          )}
        </div>

        {canEdit ? (
          <div className="flex flex-col gap-2">
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
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
              {loading ? "Uploading…" : displayUrl ? "Replace logo" : "Upload logo"}
            </Button>
            {logoUrl ? (
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
        ) : null}
      </div>
    </div>
  );
}
