import { AppShell } from "@/components/layout/app-shell";
import { requireMembership } from "@/lib/session";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, organization } = await requireMembership();

  return (
    <AppShell userName={user.name} orgName={organization.name}>
      {children}
    </AppShell>
  );
}
