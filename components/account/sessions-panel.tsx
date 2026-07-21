"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  revokeOtherSessions,
  revokeSession,
  type SessionRow,
} from "@/lib/actions/account";
import { describeUserAgent } from "@/lib/user-agent";
import { formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Monitor, Smartphone } from "lucide-react";

export function SessionsPanel({
  sessions,
  formatOpts,
}: {
  sessions: SessionRow[];
  formatOpts?: {
    locale?: string;
    timezone?: string;
  };
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function onRevoke(token: string) {
    setBusy(token);
    const result = await revokeSession(token);
    setBusy(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Session revoked");
    router.refresh();
  }

  async function onRevokeOthers() {
    if (!confirm("Sign out of all other devices?")) return;
    setBusy("others");
    try {
      await revokeOtherSessions();
      toast.success("Other sessions signed out");
      router.refresh();
    } catch {
      toast.error("Could not sign out other devices");
    } finally {
      setBusy(null);
    }
  }

  const others = sessions.filter((s) => !s.isCurrent).length;

  return (
    <div className="space-y-3">
      <ul className="divide-y divide-zinc-100 rounded-md border border-zinc-100">
        {sessions.length === 0 ? (
          <li className="px-3 py-4 text-sm text-zinc-500">No active sessions</li>
        ) : (
          sessions.map((s) => {
            const label = describeUserAgent(s.userAgent);
            const mobile = /iOS|Android/i.test(label);
            return (
              <li
                key={s.id}
                className="flex items-start justify-between gap-3 px-3 py-2.5"
              >
                <div className="flex min-w-0 gap-2.5">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-50 text-zinc-500">
                    {mobile ? (
                      <Smartphone className="h-4 w-4" />
                    ) : (
                      <Monitor className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-sm font-medium text-zinc-900">
                        {label}
                      </span>
                      {s.isCurrent ? (
                        <Badge variant="success">This device</Badge>
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {s.ipAddress ? `${s.ipAddress} · ` : ""}
                      Last active {formatDateTime(s.updatedAt, formatOpts)}
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      Signed in {formatDateTime(s.createdAt, formatOpts)} ·
                      expires {formatDateTime(s.expiresAt, formatOpts)}
                    </p>
                  </div>
                </div>
                {!s.isCurrent ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={busy === s.token}
                    onClick={() => onRevoke(s.token)}
                  >
                    {busy === s.token ? "…" : "Revoke"}
                  </Button>
                ) : null}
              </li>
            );
          })
        )}
      </ul>

      {others > 0 ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy === "others"}
          onClick={onRevokeOthers}
        >
          {busy === "others"
            ? "Signing out…"
            : `Sign out ${others} other ${others === 1 ? "device" : "devices"}`}
        </Button>
      ) : (
        <p className="text-xs text-zinc-400">
          Only this device is signed in.
        </p>
      )}
    </div>
  );
}
