import { requireMembership } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogoUpload } from "@/components/settings/logo-upload";

export default async function SettingsBrandingPage() {
  const { organization, role } = await requireMembership();

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Branding"
        description="Logo and visual identity for quotes and documents"
      />

      <Card>
        <CardHeader>
          <CardTitle>Logo</CardTitle>
          <CardDescription>
            Appears on printed quotes and PDFs. PNG, JPEG, WebP, or SVG · max 2
            MB
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LogoUpload
            logoUrl={organization.logoUrl ?? null}
            canEdit={role === "owner"}
            orgName={organization.name}
          />
          {role !== "owner" ? (
            <p className="mt-3 text-xs text-zinc-500">
              Only owners can change branding.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
