"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  CheckSquare,
  Contact,
  Home,
  Kanban,
  Settings,
  Handshake,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Home", icon: Home },
  { href: "/pipeline", label: "Pipeline", icon: Kanban },
  { href: "/deals", label: "Deals", icon: Handshake },
  { href: "/companies", label: "Companies", icon: Building2 },
  { href: "/contacts", label: "Contacts", icon: Contact },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-52 shrink-0 flex-col border-r border-zinc-200 bg-zinc-50/80">
      <div className="flex h-12 items-center border-b border-zinc-200 px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-zinc-900 text-[10px] font-bold text-white">
            OC
          </div>
          <span className="text-sm font-semibold tracking-tight text-zinc-900">
            open-crm
          </span>
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-2">
        {nav.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                active
                  ? "bg-white font-medium text-zinc-900 shadow-sm ring-1 ring-zinc-200"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              )}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-70" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
