"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, Search } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import type { AppNotifications } from "@/lib/actions/notifications";
import { NotificationBell } from "@/components/layout/notification-bell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/ui/user-avatar";

export function Header({
  userName,
  userImage,
  orgName,
  notifications,
}: {
  userName: string;
  userImage?: string | null;
  orgName: string;
  notifications: AppNotifications;
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
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-white/70 bg-white/72 px-5 shadow-sm shadow-indigo-100/50 backdrop-blur-xl">
      <form onSubmit={onSearch} className="relative max-w-xl flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-400" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search companies, contacts, deals…"
          className="h-10 rounded-2xl border-indigo-100 bg-white/80 pl-10 pr-20 text-sm shadow-sm shadow-indigo-100/40 focus-visible:ring-indigo-300"
        />
        <div className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded-lg border border-indigo-100 bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-indigo-500 sm:block">
          ⌘K
        </div>
      </form>
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <NotificationBell notifications={notifications} />
        <Link
          href="/account"
          title="Account settings"
          className="flex items-center gap-2 rounded-2xl border border-indigo-100 bg-white/80 px-2 py-1.5 shadow-sm transition hover:bg-indigo-50/60 sm:px-3 sm:py-2"
        >
          <div className="hidden text-right sm:block">
            <div className="text-xs font-semibold text-zinc-900">{userName}</div>
            <div className="text-[11px] text-indigo-500">{orgName}</div>
          </div>
          <UserAvatar
            name={userName}
            image={userImage}
            size="sm"
            title={`${userName} — account settings`}
          />
        </Link>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleSignOut}
          title="Sign out"
          className="rounded-2xl border border-zinc-200 bg-white/80 text-zinc-600 shadow-sm hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
