"use client";

import Link from "next/link";
import { useState } from "react";
import { Bell, Inbox } from "lucide-react";
import type { AppNotifications } from "@/lib/actions/notifications";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function formatRelative(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  const diffMs = Date.now() - d.getTime();
  if (Number.isNaN(diffMs)) return "";
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

function badgeLabel(count: number) {
  if (count > 99) return "99+";
  return String(count);
}

export function NotificationBell({
  notifications,
}: {
  notifications: AppNotifications;
}) {
  const [open, setOpen] = useState(false);
  const { count, items } = notifications;

  return (
    <div className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        title={
          count > 0
            ? `${count} new ${count === 1 ? "enquiry" : "enquiries"}`
            : "Notifications"
        }
        aria-label={
          count > 0
            ? `Notifications, ${count} new`
            : "Notifications"
        }
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {count > 0 ? (
          <span
            className={cn(
              "absolute -right-0.5 -top-0.5 flex min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-none text-white",
              count > 9 ? "h-[16px] px-1" : "h-4 w-4"
            )}
          >
            {badgeLabel(count)}
          </span>
        ) : null}
      </Button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-1 w-80 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-zinc-100 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Notifications
              </p>
              {count > 0 ? (
                <span className="rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-700">
                  {count} new
                </span>
              ) : null}
            </div>

            {items.length === 0 ? (
              <div className="px-3 py-8 text-center">
                <Inbox className="mx-auto h-8 w-8 text-zinc-300" />
                <p className="mt-2 text-sm text-zinc-500">
                  No new enquiries
                </p>
                <p className="mt-0.5 text-xs text-zinc-400">
                  You&apos;re all caught up
                </p>
              </div>
            ) : (
              <ul className="max-h-80 divide-y divide-zinc-100 overflow-y-auto">
                {items.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex gap-2.5 px-3 py-2.5 transition-colors hover:bg-zinc-50"
                    >
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                        <Inbox className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-zinc-900">
                          {item.title}
                        </span>
                        {item.subtitle ? (
                          <span className="mt-0.5 block truncate text-xs text-zinc-500">
                            {item.subtitle}
                          </span>
                        ) : null}
                        <span className="mt-0.5 block text-[11px] text-zinc-400">
                          New enquiry · {formatRelative(item.createdAt)}
                        </span>
                      </span>
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            <div className="border-t border-zinc-100 bg-zinc-50/80 px-3 py-2">
              <Link
                href="/enquiries"
                onClick={() => setOpen(false)}
                className="text-xs font-medium text-zinc-700 hover:text-zinc-900 hover:underline"
              >
                View all enquiries →
              </Link>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

/** Compact red count chip for nav items */
export function NavBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="ml-auto flex h-4 min-w-[16px] shrink-0 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-none text-white">
      {badgeLabel(count)}
    </span>
  );
}
