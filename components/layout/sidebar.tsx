"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Building2,
  CheckSquare,
  ChevronDown,
  Contact,
  FileText,
  Globe2,
  Home,
  ImageIcon,
  Inbox,
  Kanban,
  Package,
  Settings,
  Handshake,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NavBadge } from "@/components/layout/notification-bell";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  accent: string;
  badgeKey?: string;
};

type NavSection = {
  id: string;
  label: string;
  eyebrow: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    id: "workspace",
    label: "Workspace",
    eyebrow: "Today",
    items: [
      {
        href: "/",
        label: "Home",
        icon: Home,
        accent: "from-sky-500 to-indigo-500",
      },
      {
        href: "/pipeline",
        label: "Pipeline",
        icon: Kanban,
        accent: "from-violet-500 to-fuchsia-500",
      },
      {
        href: "/tasks",
        label: "Tasks",
        icon: CheckSquare,
        accent: "from-emerald-500 to-teal-500",
      },
    ],
  },
  {
    id: "sales",
    label: "Sales",
    eyebrow: "Pipeline",
    items: [
      {
        href: "/deals",
        label: "Deals",
        icon: Handshake,
        accent: "from-amber-500 to-orange-500",
      },
      {
        href: "/enquiries",
        label: "Enquiries",
        icon: Inbox,
        accent: "from-rose-500 to-pink-500",
        badgeKey: "newEnquiries",
      },
      {
        href: "/quotes",
        label: "Quotes",
        icon: FileText,
        accent: "from-indigo-500 to-blue-500",
      },
      {
        href: "/services",
        label: "Services",
        icon: Package,
        accent: "from-teal-500 to-cyan-500",
      },
    ],
  },
  {
    id: "directory",
    label: "Directory",
    eyebrow: "Records",
    items: [
      {
        href: "/companies",
        label: "Companies",
        icon: Building2,
        accent: "from-cyan-500 to-blue-500",
      },
      {
        href: "/contacts",
        label: "Contacts",
        icon: Contact,
        accent: "from-fuchsia-500 to-purple-500",
      },
    ],
  },
  {
    id: "admin",
    label: "Organization",
    eyebrow: "Setup",
    items: [
      {
        href: "/settings",
        label: "Profile",
        icon: Building2,
        accent: "from-slate-500 to-zinc-700",
      },
      {
        href: "/settings/branding",
        label: "Branding",
        icon: ImageIcon,
        accent: "from-violet-500 to-purple-600",
      },
      {
        href: "/settings/regional",
        label: "Regional",
        icon: Globe2,
        accent: "from-sky-500 to-blue-600",
      },
      {
        href: "/settings/team",
        label: "Team",
        icon: Users,
        accent: "from-emerald-500 to-green-600",
      },
      {
        href: "/account",
        label: "Your account",
        icon: Settings,
        accent: "from-zinc-500 to-slate-700",
      },
    ],
  },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  // Prefer exact match for settings root so /settings/branding does not also highlight Profile
  if (href === "/settings") return pathname === "/settings";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({
  badges = {},
}: {
  /** e.g. { newEnquiries: 3 } */
  badges?: Record<string, number>;
}) {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    () => Object.fromEntries(navSections.map((section) => [section.id, true]))
  );

  function toggleSection(id: string) {
    setOpenSections((current) => ({ ...current, [id]: !current[id] }));
  }

  function badgeFor(key?: string) {
    if (!key) return 0;
    return badges[key] ?? 0;
  }

  function sectionBadge(section: NavSection) {
    return section.items.reduce((sum, item) => sum + badgeFor(item.badgeKey), 0);
  }

  return (
    <aside className="relative flex w-60 shrink-0 flex-col overflow-hidden border-r border-indigo-100/80 bg-gradient-to-b from-slate-950 via-slate-950 to-indigo-950 text-white shadow-2xl shadow-indigo-950/20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.45),transparent_42%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.24),transparent_36%)]" />
      <div className="relative flex h-16 items-center border-b border-white/10 px-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 via-violet-500 to-fuchsia-500 text-[11px] font-black text-white shadow-lg shadow-indigo-500/30 ring-1 ring-white/20">
            OC
          </div>
          <div>
            <span className="block text-sm font-semibold tracking-tight text-white">
              open-crm
            </span>
            <span className="text-[11px] font-medium text-indigo-200/80">
              sales workspace
            </span>
          </div>
        </Link>
      </div>

      <nav className="relative flex flex-1 flex-col gap-3 overflow-y-auto p-3">
        {navSections.map((section) => {
          const open = openSections[section.id] ?? true;
          const activeInSection = section.items.some((item) =>
            isActivePath(pathname, item.href)
          );
          const sectionCount = sectionBadge(section);

          return (
            <section
              key={section.id}
              className={cn(
                "rounded-2xl border border-white/10 bg-white/[0.035] p-1.5 shadow-sm shadow-black/10 transition-colors",
                activeInSection && "border-indigo-300/30 bg-indigo-400/[0.08]"
              )}
            >
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                aria-expanded={open}
                className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left transition hover:bg-white/10"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-200/70">
                    {section.eyebrow}
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {section.label}
                  </span>
                </span>
                {!open && sectionCount > 0 ? (
                  <NavBadge count={sectionCount} />
                ) : null}
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-indigo-100/75 transition-transform duration-200",
                    !open && "-rotate-90"
                  )}
                />
              </button>

              <div
                className={cn(
                  "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
                  open
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-60"
                )}
              >
                <div className="overflow-hidden">
                  <div className="mt-1 space-y-1">
                    {section.items.map((item) => {
                      const active = isActivePath(pathname, item.href);
                      const Icon = item.icon;
                      const count = badgeFor(item.badgeKey);

                      return (
                        <Link
                          key={`${section.id}-${item.href}-${item.label}`}
                          href={item.href}
                          className={cn(
                            "group flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition-all",
                            active
                              ? "bg-white text-slate-950 shadow-lg shadow-indigo-950/20"
                              : "text-indigo-100/78 hover:bg-white/10 hover:text-white"
                          )}
                        >
                          <span
                            className={cn(
                              "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm transition-transform group-hover:scale-105",
                              item.accent,
                              active ? "shadow-indigo-500/20" : "opacity-85"
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </span>
                          <span className="min-w-0 flex-1 font-medium">
                            {item.label}
                          </span>
                          <NavBadge count={count} />
                          {active ? (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.9)]" />
                          ) : null}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </nav>

      <div className="relative border-t border-white/10 p-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-xs text-indigo-50">
          <div className="font-semibold">Workspace menu</div>
          <div className="mt-0.5 text-indigo-100/70">
            Collapse sections to stay focused.
          </div>
        </div>
      </div>
    </aside>
  );
}
