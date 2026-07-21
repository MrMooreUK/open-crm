import Link from "next/link";
import { requireMembership } from "@/lib/session";
import { orgToFormValues } from "@/lib/org-form-values";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OrgProfileForm } from "@/components/settings/org-profile-form";

export default async function SettingsProfilePage() {
  const { organization, role } = await requireMembership();
  const values = orgToFormValues(organization);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Company profile"
        description="Workspace identity used on quotes and documents"
      />

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Name, contact details, address, tax ID, and quote footer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrgProfileForm canEdit={role === "owner"} values={values} />
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-xs text-zinc-400">
        Looking for your personal profile or password?{" "}
        <Link
          href="/account"
          className="font-medium text-zinc-700 underline-offset-4 hover:underline"
        >
          Open your account
        </Link>
      </p>
    </div>
  );
}
