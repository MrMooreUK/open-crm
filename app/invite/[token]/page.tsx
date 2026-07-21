import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AcceptInviteButton } from "@/components/settings/accept-invite-button";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const session = await getSession();

  if (!session) {
    redirect(`/login?next=/invite/${token}`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-base">Join workspace</CardTitle>
          <CardDescription>
            Signed in as {session.user.email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <AcceptInviteButton token={token} />
          <p className="text-center text-xs text-zinc-500">
            <Link href="/" className="underline underline-offset-2">
              Back home
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
