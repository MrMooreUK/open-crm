import { AppShell } from "@/components/layout/app-shell";
import { getAppNotifications } from "@/lib/actions/notifications";
import { requireMembership } from "@/lib/session";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [{ user, organization }, notifications] = await Promise.all([
    requireMembership(),
    getAppNotifications(),
  ]);

  return (
    <AppShell
      userName={user.name}
      userImage={user.image}
      orgName={organization.name}
      notifications={notifications}
    >
      {children}
    </AppShell>
  );
}
