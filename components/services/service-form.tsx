"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { createService, updateService } from "@/lib/actions/services";
import { CURRENCIES } from "@/lib/settings-options";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

type Service = {
  id: string;
  name: string;
  description: string | null;
  unitPriceCents: number;
  unit: string;
  currency: string;
  isActive: boolean;
};

export function ServiceForm({
  service,
  defaultCurrency = "USD",
  onDone,
}: {
  service?: Service;
  defaultCurrency?: string;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    // checkbox only present when checked
    if (!formData.has("isActive")) formData.set("isActive", "false");
    else formData.set("isActive", "true");

    const result = service
      ? await updateService(service.id, formData)
      : await createService(formData);
    setLoading(false);

    if ("error" in result && result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(service ? "Service updated" : "Service added");
    e.currentTarget.reset();
    onDone?.();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          required
          placeholder="Consulting (hourly)"
          defaultValue={service?.name}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={2}
          placeholder="Optional default line text on quotes"
          defaultValue={service?.description ?? ""}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="unitPrice">Rate</Label>
          <Input
            id="unitPrice"
            name="unitPrice"
            type="number"
            min={0}
            step="0.01"
            required
            defaultValue={
              service ? (service.unitPriceCents / 100).toFixed(2) : ""
            }
            placeholder="150.00"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="unit">Unit</Label>
          <Select id="unit" name="unit" defaultValue={service?.unit ?? "hour"}>
            <option value="hour">Per hour</option>
            <option value="day">Per day</option>
            <option value="item">Per item</option>
            <option value="project">Per project</option>
            <option value="month">Per month</option>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="currency">Currency</Label>
          <Select
            id="currency"
            name="currency"
            defaultValue={service?.currency ?? defaultCurrency}
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-zinc-700">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={service?.isActive ?? true}
          className="h-3.5 w-3.5 rounded border-zinc-300"
        />
        Active (available when quoting)
      </label>
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? "Saving…" : service ? "Save" : "Add service"}
      </Button>
    </form>
  );
}
