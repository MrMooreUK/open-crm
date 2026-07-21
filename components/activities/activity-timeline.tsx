"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { createActivity, deleteActivity } from "@/lib/actions/activities";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

type Activity = {
  id: string;
  type: "note" | "call" | "email" | "meeting" | "task";
  body: string;
  dueAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  createdBy: { name: string } | null;
};

export function ActivityTimeline({
  activities,
  companyId,
  contactId,
  dealId,
}: {
  activities: Activity[];
  companyId?: string;
  contactId?: string;
  dealId?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("note");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    if (companyId) formData.set("companyId", companyId);
    if (contactId) formData.set("contactId", contactId);
    if (dealId) formData.set("dealId", dealId);

    const result = await createActivity(formData);
    setLoading(false);

    if ("error" in result && result.error) {
      toast.error(result.error);
      return;
    }

    form.reset();
    setType("note");
    toast.success("Activity added");
    router.refresh();
  }

  async function onDelete(id: string) {
    await deleteActivity(id);
    toast.success("Deleted");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={onSubmit} className="space-y-2">
          <Select
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="note">Note</option>
            <option value="call">Call</option>
            <option value="email">Email</option>
            <option value="meeting">Meeting</option>
            <option value="task">Task</option>
          </Select>
          <Textarea
            name="body"
            required
            placeholder={type === "task" ? "What needs doing?" : "Write a note…"}
            rows={3}
          />
          {type === "task" ? (
            <Input name="dueAt" type="date" />
          ) : null}
          <Button type="submit" size="sm" disabled={loading}>
            {loading ? "Adding…" : "Add"}
          </Button>
        </form>

        <ul className="space-y-3">
          {activities.length === 0 ? (
            <li className="text-sm text-zinc-500">No activity yet.</li>
          ) : (
            activities.map((a) => (
              <li
                key={a.id}
                className="rounded-md border border-zinc-100 bg-zinc-50/50 p-2.5"
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="capitalize">
                      {a.type}
                    </Badge>
                    {a.dueAt ? (
                      <span className="text-[11px] text-zinc-500">
                        Due {formatDate(a.dueAt)}
                      </span>
                    ) : null}
                    {a.completedAt ? (
                      <Badge variant="success">Done</Badge>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => onDelete(a.id)}
                    className="text-[11px] text-zinc-400 hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
                <p className="whitespace-pre-wrap text-sm text-zinc-800">
                  {a.body}
                </p>
                <p className="mt-1 text-[11px] text-zinc-400">
                  {a.createdBy?.name ?? "Someone"} · {formatDate(a.createdAt)}
                </p>
              </li>
            ))
          )}
        </ul>
      </CardContent>
    </Card>
  );
}
