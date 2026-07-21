import Link from "next/link";
import { getAccountContext } from "@/lib/actions/account";
import { formatDate } from "@/lib/utils";
import { DEFAULT_ORG_SETTINGS } from "@/lib/settings-options";
import { requireMembership } from "@/lib/session";
import { ProfileForm } from "@/components/account/profile-form";
import { PasswordForm } from "@/components/account/password-form";
import { SessionsPanel } from "@/components/account/sessions-panel";
import { PageHeader } from "@/components/ui/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

export default async function AccountPage() {
  const { organization } = await requireMembership();
  const ctx = await getAccountContext();

  const formatOpts = {
    locale: organization.locale ?? DEFAULT_ORG_SETTINGS.locale,
    timezone: organization.timezone ?? DEFAULT_ORG_SETTINGS.timezone,
    dateFormat: organization.dateFormat ?? DEFAULT_ORG_SETTINGS.dateFormat,
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Your account"
        description="Profile, security, and signed-in devices"
      />

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              {ctx.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={ctx.user.image}
                  alt=""
                  className="h-12 w-12 rounded-full border border-zinc-200 object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
                  {initials(ctx.user.name)}
                </div>
              )}
              <div className="min-w-0">
                <CardTitle className="text-base">{ctx.user.name}</CardTitle>
                <CardDescription className="truncate">
                  {ctx.user.email}
                </CardDescription>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <Badge variant="secondary" className="capitalize">
                    {ctx.role}
                  </Badge>
                  {ctx.user.emailVerified ? (
                    <Badge variant="success">Email verified</Badge>
                  ) : (
                    <Badge variant="outline">Email unverified</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-1 text-xs text-zinc-500">
            <p>
              Member of{" "}
              <Link
                href="/settings"
                className="font-medium text-zinc-800 hover:underline"
              >
                {ctx.organization.name}
              </Link>
            </p>
            <p>Joined {formatDate(ctx.user.createdAt, formatOpts)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              How you appear across the workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm
              name={ctx.user.name}
              email={ctx.user.email}
              image={ctx.user.image}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Change the password you use to sign in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sessions</CardTitle>
            <CardDescription>
              Devices currently signed in to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SessionsPanel
              sessions={ctx.sessions}
              formatOpts={formatOpts}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workspace</CardTitle>
            <CardDescription>
              Organization settings are managed separately
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-zinc-600">
              Company profile, branding, regional defaults, and team invites
              live under organization settings.
            </p>
            <Link
              href="/settings"
              className="text-sm font-medium text-zinc-900 underline-offset-4 hover:underline"
            >
              Open organization settings →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
