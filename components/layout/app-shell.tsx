import type { AppNotifications } from "@/lib/actions/notifications";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

export function AppShell({
  children,
  userName,
  userImage,
  orgName,
  notifications,
}: {
  children: React.ReactNode;
  userName: string;
  userImage?: string | null;
  orgName: string;
  notifications: AppNotifications;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.12),transparent_32%),linear-gradient(135deg,#f8fafc_0%,#eef2ff_42%,#fff7ed_100%)] text-zinc-900">
      <Sidebar
        badges={{
          newEnquiries: notifications.newEnquiries,
        }}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          userName={userName}
          userImage={userImage}
          orgName={orgName}
          notifications={notifications}
        />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
