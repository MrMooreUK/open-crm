import { requireMembership } from "@/lib/session";

/** Minimal layout for printable documents (no CRM chrome). */
export default async function PrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireMembership();
  return <>{children}</>;
}
