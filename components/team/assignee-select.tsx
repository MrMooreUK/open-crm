"use client";

import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export type AssigneeOption = {
  userId: string;
  name: string;
  email: string;
};

export function AssigneeSelect({
  members,
  name = "ownerId",
  defaultValue,
  label = "Assigned to",
  allowUnassigned = false,
  id = "ownerId",
}: {
  members: AssigneeOption[];
  name?: string;
  defaultValue?: string | null;
  label?: string;
  allowUnassigned?: boolean;
  id?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Select id={id} name={name} defaultValue={defaultValue ?? ""}>
        {allowUnassigned ? (
          <option value="">Unassigned</option>
        ) : (
          <option value="" disabled>
            Select teammate…
          </option>
        )}
        {members.map((m) => (
          <option key={m.userId} value={m.userId}>
            {m.name}
            {m.email ? ` (${m.email})` : ""}
          </option>
        ))}
      </Select>
    </div>
  );
}
