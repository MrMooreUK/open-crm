import { InviteForm } from "@/components/settings/invite-form";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type Invite = {
  id: string;
  email: string;
  token: string;
  expiresAt: Date;
};

export function TeamPanel({
  members,
  invites,
  canInvite,
  formatOpts,
}: {
  members: Member[];
  invites: Invite[];
  canInvite: boolean;
  formatOpts?: {
    locale?: string;
    timezone?: string;
    dateFormat?: string;
  };
}) {
  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Members
        </h3>
        <ul className="divide-y divide-zinc-100 rounded-md border border-zinc-100">
          {members.map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between px-3 py-2.5"
            >
              <div>
                <div className="text-sm font-medium text-zinc-900">{m.name}</div>
                <div className="text-xs text-zinc-500">{m.email}</div>
              </div>
              <Badge variant="secondary" className="capitalize">
                {m.role}
              </Badge>
            </li>
          ))}
        </ul>
      </section>

      {canInvite ? (
        <section className="space-y-3">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Invite teammate
            </h3>
            <p className="mt-0.5 text-xs text-zinc-400">
              Share an invite link so they can join this workspace
            </p>
          </div>
          <InviteForm />
          {invites.length > 0 ? (
            <div>
              <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                Pending invites
              </h4>
              <ul className="space-y-2">
                {invites.map((inv) => (
                  <li
                    key={inv.id}
                    className="rounded-md border border-zinc-100 bg-zinc-50 px-3 py-2 text-sm"
                  >
                    <div className="font-medium">{inv.email}</div>
                    <div className="text-xs text-zinc-500">
                      Expires {formatDate(inv.expiresAt, formatOpts)} ·{" "}
                      <code className="rounded bg-white px-1 text-[11px]">
                        /invite/{inv.token}
                      </code>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : (
        <p className="text-xs text-zinc-500">
          Only owners can invite teammates.
        </p>
      )}
    </div>
  );
}
