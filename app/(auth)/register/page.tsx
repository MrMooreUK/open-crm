"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") || "");
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");
    const organizationName = String(form.get("organizationName") || "");

    const { data, error } = await signUp.email({
      name,
      email,
      password,
    });

    if (error || !data?.user) {
      setLoading(false);
      toast.error(error?.message || "Could not create account");
      return;
    }

    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organizationName }),
    });

    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body.error || "Account created but workspace setup failed");
      router.push("/onboarding");
      return;
    }

    toast.success("Welcome to open-crm");
    router.push("/");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-zinc-900 text-[11px] font-bold text-white">
            OC
          </div>
          <span className="text-sm font-semibold">open-crm</span>
        </div>
        <CardTitle className="text-base">Create account</CardTitle>
        <CardDescription>Own your pipeline in minutes</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="name">Your name</Label>
            <Input id="name" name="name" required autoComplete="name" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="organizationName">Organization</Label>
            <Input
              id="organizationName"
              name="organizationName"
              required
              placeholder="Acme Inc"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="At least 8 characters"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating…" : "Create workspace"}
          </Button>
        </form>
        <p className="mt-4 text-center text-xs text-zinc-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-zinc-900 underline-offset-2 hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
