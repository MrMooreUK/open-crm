"use client";

import { useRouter } from "next/navigation";
import { completeTask } from "@/lib/actions/activities";

export function TaskCompleteButton({ id }: { id: string }) {
  const router = useRouter();

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    await completeTask(id, e.target.checked);
    router.refresh();
  }

  return (
    <input
      type="checkbox"
      className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-400"
      onChange={onChange}
      aria-label="Complete task"
    />
  );
}
