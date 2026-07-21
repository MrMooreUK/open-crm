import { requireMembership } from "@/lib/session";
import { listInvites, listMembers } from "@/lib/actions/settings";
import { DEFAULT_ORG_SETTINGS } from "@/lib/settings-options";
import { PageHeader } from "@/components/ui/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TeamPanel } from "@/components/settings/team-panel";

export default async function SettingsTeamPage() {
  const { organization, role } = await requireMembership();
  const [members, invites] = await Promise.all([
    listMembers(),
    listInvites(),
  ]);

  const formatOpts = {
    locale: organization.locale ?? DEFAULT_ORG_SETTINGS.locale,
    timezone: organization.timezone ?? DEFAULT_ORG_SETTINGS.timezone,
    dateFormat: organization.dateFormat ?? DEFAULT_ORG_SETTINGS.dateFormat,
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Team"
        description="People with access to this workspace"
      />

      <Card>
        <CardHeader>
          <CardTitle>Team</CardTitle>
          <CardDescription>
            Members and pending invites for {organization.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TeamPanel
            members={members}
            invites={invites}
            canInvite={role === "owner"}
            formatOpts={formatOpts}
          />
        </CardContent>
      </Card>
    </div>
  );
}
