import { requireMembership } from "@/lib/session";
import {
  listInvites,
  listMembers,
} from "@/lib/actions/settings";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OrgSettingsForm } from "@/components/settings/org-settings-form";
import { InviteForm } from "@/components/settings/invite-form";
import { formatDate } from "@/lib/utils";

export default async function SettingsPage() {
  const { organization, role } = await requireMembership();
  const [members, invites] = await Promise.all([
    listMembers(),
    listInvites(),
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Settings" description="Organization and team" />

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Organization</CardTitle>
          </CardHeader>
          <CardContent>
            <OrgSettingsForm
              name={organization.name}
              canEdit={role === "owner"}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-zinc-100">
              {members.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between py-2.5"
                >
                  <div>
                    <div className="text-sm font-medium text-zinc-900">
                      {m.name}
                    </div>
                    <div className="text-xs text-zinc-500">{m.email}</div>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {m.role}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {role === "owner" ? (
          <Card>
            <CardHeader>
              <CardTitle>Invite teammate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                          Expires {formatDate(inv.expiresAt)} ·{" "}
                          <code className="rounded bg-white px-1 text-[11px]">
                            /invite/{inv.token}
                          </code>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
