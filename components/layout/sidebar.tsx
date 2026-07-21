"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BookOpen,
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
import { BrandMark } from "@/components/ui/brand-mark";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badgeKey?: string;
};

type NavSection = {
  id: string;
  label: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    id: "workspace",
    label: "Workspace",
    items: [
      { href: "/", label: "Home", icon: Home },
      { href: "/pipeline", label: "Pipeline", icon: Kanban },
      { href: "/tasks", label: "Tasks", icon: CheckSquare },
    ],
  },
  {
    id: "sales",
    label: "Sales",
    items: [
      { href: "/deals", label: "Deals", icon: Handshake },
      {
        href: "/enquiries",
        label: "Enquiries",
        icon: Inbox,
        badgeKey: "newEnquiries",
      },
      { href: "/quotes", label: "Quotes", icon: FileText },
      { href: "/services", label: "Services", icon: Package },
    ],
  },
  {
    id: "directory",
    label: "Directory",
    items: [
      { href: "/companies", label: "Companies", icon: Building2 },
      { href: "/contacts", label: "Contacts", icon: Contact },
    ],
  },
  {
    id: "admin",
    label: "Organization",
    items: [
      { href: "/settings", label: "Profile", icon: Building2 },
      { href: "/settings/branding", label: "Branding", icon: ImageIcon },
      { href: "/settings/regional", label: "Regional", icon: Globe2 },
      { href: "/settings/team", label: "Team", icon: Users },
      { href: "/account", label: "Your account", icon: Settings },
      { href: "/docs", label: "Documentation", icon: BookOpen },
    ],
  },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/settings") return pathname === "/settings";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({
  badges = {},
}: {
  badges?: Record<string, number>;
}) {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    () => Object.fromEntries(navSections.map((s) => [s.id, true]))
  );

  function toggleSection(id: string) {
    setOpenSections((c) => ({ ...c, [id]: !c[id] }));
  }

  function badgeFor(key?: string) {
    if (!key) return 0;
    return badges[key] ?? 0;
  }

  function sectionBadge(section: NavSection) {
    return section.items.reduce((sum, item) => sum + badgeFor(item.badgeKey), 0);
  }

  return (
    <aside className="flex w-52 shrink-0 flex-col border-r border-zinc-200 bg-zinc-50">
      <div className="flex h-12 items-center border-b border-zinc-200 px-3">
        <Link href="/" className="flex items-center gap-2">
          <BrandMark size="sm" />
          <span className="text-sm font-semibold tracking-tight text-zinc-900">
            open-crm
          </span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-3 overflow-y-auto p-2">
        {navSections.map((section) => {
          const open = openSections[section.id] ?? true;
          const sectionCount = sectionBadge(section);

          return (
            <div key={section.id}>
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                aria-expanded={open}
                className="mb-0.5 flex w-full items-center gap-1 rounded px-2 py-1 text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-400 hover:text-zinc-600"
              >
                <span className="min-w-0 flex-1 truncate">{section.label}</span>
                {!open && sectionCount > 0 ? (
                  <NavBadge count={sectionCount} />
                ) : null}
                <ChevronDown
                  className={cn(
                    "h-3 w-3 shrink-0 transition-transform",
                    !open && "-rotate-90"
                  )}
                />
              </button>

              {open ? (
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const active = isActivePath(pathname, item.href);
                    const Icon = item.icon;
                    const count = badgeFor(item.badgeKey);

                    return (
                      <Link
                        key={`${section.id}-${item.href}-${item.label}`}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                          active
                            ? "bg-white font-medium text-zinc-900 shadow-sm ring-1 ring-zinc-200"
                            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0",
                            active ? "text-brand" : "opacity-70"
                          )}
                        />
                        <span className="min-w-0 flex-1 truncate">
                          {item.label}
                        </span>
                        <NavBadge count={count} />
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
