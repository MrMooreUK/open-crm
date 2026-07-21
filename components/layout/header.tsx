"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, Search } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Header({
  userName,
  orgName,
}: {
  userName: string;
  orgName: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) {
      router.push(`/search?q=${encodeURIComponent(q.trim())}`);
    }
  }

  async function handleSignOut() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex h-12 shrink-0 items-center gap-4 border-b border-zinc-200 bg-white px-4">
      <form onSubmit={onSearch} className="relative max-w-md flex-1">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search companies, contacts, deals…"
          className="h-8 bg-zinc-50 pl-8 text-sm"
        />
      </form>
      <div className="ml-auto flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <div className="text-xs font-medium text-zinc-900">{userName}</div>
          <div className="text-[11px] text-zinc-500">{orgName}</div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleSignOut}
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
