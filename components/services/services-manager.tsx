"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  deleteService,
  toggleServiceActive,
} from "@/lib/actions/services";
import { ServiceForm } from "@/components/services/service-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export type ServiceRow = {
  id: string;
  name: string;
  description: string | null;
  unitPriceCents: number;
  unit: string;
  currency: string;
  isActive: boolean;
};

const UNIT_LABEL: Record<string, string> = {
  hour: "/hr",
  day: "/day",
  item: "/item",
  project: "/project",
  month: "/mo",
};

export function ServicesManager({
  services,
  defaultCurrency,
}: {
  services: ServiceRow[];
  defaultCurrency: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<ServiceRow | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function onDelete(id: string) {
    if (!confirm("Delete this service?")) return;
    await deleteService(id);
    toast.success("Service deleted");
    router.refresh();
  }

  async function onToggle(id: string, isActive: boolean) {
    await toggleServiceActive(id, isActive);
    toast.success(isActive ? "Service activated" : "Service archived");
    router.refresh();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <div className="space-y-3 lg:col-span-3">
        {services.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50/50 px-6 py-12 text-center">
            <h3 className="text-sm font-medium text-zinc-900">No services yet</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Add services with rates so quoting is one click.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-zinc-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 text-xs font-medium uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-3 py-2">Service</th>
                  <th className="px-3 py-2">Rate</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {services.map((s) => (
                  <tr key={s.id} className="hover:bg-zinc-50/80">
                    <td className="px-3 py-2.5">
                      <div className="font-medium text-zinc-900">{s.name}</div>
                      {s.description ? (
                        <div className="line-clamp-1 text-xs text-zinc-500">
                          {s.description}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-3 py-2.5 text-zinc-700">
                      {formatCurrency(s.unitPriceCents, s.currency)}
                      <span className="text-zinc-400">
                        {UNIT_LABEL[s.unit] ?? ""}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge variant={s.isActive ? "success" : "secondary"}>
                        {s.isActive ? "Active" : "Archived"}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditing(s);
                            setShowForm(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onToggle(s.id, !s.isActive)}
                        >
                          {s.isActive ? "Archive" : "Activate"}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(s.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="lg:col-span-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>{editing ? "Edit service" : "Add service"}</CardTitle>
            {editing || showForm ? (
              <button
                type="button"
                className="text-xs text-zinc-500 hover:text-zinc-900"
                onClick={() => {
                  setEditing(null);
                  setShowForm(false);
                }}
              >
                Clear
              </button>
            ) : null}
          </CardHeader>
          <CardContent>
            <ServiceForm
              key={editing?.id ?? "new"}
              service={editing ?? undefined}
              defaultCurrency={defaultCurrency}
              onDone={() => {
                setEditing(null);
                setShowForm(false);
              }}
            />
          </CardContent>
        </Card>
        <p className="mt-3 text-xs text-zinc-500">
          Services appear in the quote builder so you can add priced lines
          instantly.
        </p>
      </div>
    </div>
  );
}
