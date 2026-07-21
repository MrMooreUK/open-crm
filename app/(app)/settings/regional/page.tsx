import { requireMembership } from "@/lib/session";
import { orgToFormValues } from "@/lib/org-form-values";
import { PageHeader } from "@/components/ui/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OrgRegionalForm } from "@/components/settings/org-regional-form";

export default async function SettingsRegionalPage() {
  const { organization, role } = await requireMembership();
  const values = orgToFormValues(organization);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Regional"
        description="Defaults for money, dates, and time across the workspace"
      />

      <Card>
        <CardHeader>
          <CardTitle>Regional preferences</CardTitle>
          <CardDescription>
            Timezone, currency, locale, date format, week start, and fiscal year
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrgRegionalForm canEdit={role === "owner"} values={values} />
        </CardContent>
      </Card>
    </div>
  );
}
