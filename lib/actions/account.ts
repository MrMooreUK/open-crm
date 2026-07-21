"use server";

import { and, desc, eq, gt, ne } from "drizzle-orm";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { session as sessionTable, user } from "@/lib/db/schema";
import { requireMembership, requireSession } from "@/lib/session";
import {
  changePasswordSchema,
  userProfileSchema,
} from "@/lib/validations";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_AVATAR_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

function authErrorMessage(e: unknown, fallback: string) {
  if (!e || typeof e !== "object") return fallback;
  const err = e as {
    message?: string;
    body?: { message?: string };
    status?: string | number;
  };
  return err.body?.message || err.message || fallback;
}

function publicUploadPath(url: string) {
  // strip cache-bust query: /uploads/avatars/x.png?v=…
  const clean = url.split("?")[0] ?? url;
  if (!clean.startsWith("/uploads/")) return null;
  return path.join(process.cwd(), "public", clean);
}

async function deleteLocalUpload(url: string | null | undefined) {
  if (!url) return;
  const full = publicUploadPath(url);
  if (!full) return;
  try {
    await unlink(full);
  } catch {
    // ignore missing file
  }
}

export async function updateProfile(formData: FormData) {
  const authSession = await requireSession();
  const currentUser = authSession.user;

  const parsed = userProfileSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const name = parsed.data.name.trim();
  const email = parsed.data.email.trim().toLowerCase();

  if (email !== currentUser.email.toLowerCase()) {
    const existing = await db.query.user.findFirst({
      where: eq(user.email, email),
      columns: { id: true },
    });
    if (existing && existing.id !== currentUser.id) {
      return { error: "That email is already in use" };
    }
  }

  try {
    // Prefer Better Auth so the session cookie cache stays in sync
    await auth.api.updateUser({
      headers: await headers(),
      body: { name },
    });
  } catch (e) {
    return { error: authErrorMessage(e, "Could not update profile") };
  }

  // Email is not updatable via updateUser — apply directly when changed
  if (email !== currentUser.email.toLowerCase()) {
    await db
      .update(user)
      .set({
        email,
        emailVerified: false,
        updatedAt: new Date(),
      })
      .where(eq(user.id, currentUser.id));
  }

  revalidatePath("/account");
  revalidatePath("/");
  return { ok: true as const };
}

export async function uploadAvatar(formData: FormData) {
  const authSession = await requireSession();
  const userId = authSession.user.id;

  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose an image file" };
  }
  if (file.size > MAX_AVATAR_BYTES) {
    return { error: "Photo must be under 2 MB" };
  }

  const ext = ALLOWED_AVATAR_TYPES[file.type];
  if (!ext) {
    return { error: "Use PNG, JPEG, or WebP" };
  }

  const dir = path.join(process.cwd(), "public", "uploads", "avatars");
  await mkdir(dir, { recursive: true });

  // Load current image from DB (session cache may be stale)
  const dbUser = await db.query.user.findFirst({
    where: eq(user.id, userId),
    columns: { image: true },
  });
  await deleteLocalUpload(dbUser?.image);

  const filename = `${userId}.${ext}`;
  const fullPath = path.join(dir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(fullPath, buffer);

  // cache-bust so browsers pick up replacements
  const imageUrl = `/uploads/avatars/${filename}?v=${Date.now()}`;

  try {
    await auth.api.updateUser({
      headers: await headers(),
      body: { image: imageUrl },
    });
  } catch (e) {
    // Clean up written file if DB update fails
    try {
      await unlink(fullPath);
    } catch {
      // ignore
    }
    return { error: authErrorMessage(e, "Could not save photo") };
  }

  revalidatePath("/account");
  revalidatePath("/");
  return { imageUrl };
}

export async function removeAvatar() {
  const authSession = await requireSession();
  const userId = authSession.user.id;

  const dbUser = await db.query.user.findFirst({
    where: eq(user.id, userId),
    columns: { image: true },
  });

  await deleteLocalUpload(dbUser?.image);

  try {
    await auth.api.updateUser({
      headers: await headers(),
      body: { image: null },
    });
  } catch (e) {
    return { error: authErrorMessage(e, "Could not remove photo") };
  }

  revalidatePath("/account");
  revalidatePath("/");
  return { ok: true as const };
}

export async function changePassword(formData: FormData) {
  await requireSession();

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
    revokeOtherSessions: formData.get("revokeOtherSessions") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await auth.api.changePassword({
      headers: await headers(),
      body: {
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
        revokeOtherSessions: parsed.data.revokeOtherSessions,
      },
    });
  } catch (e) {
    return { error: authErrorMessage(e, "Could not change password") };
  }

  revalidatePath("/account");
  return { ok: true as const };
}

export type SessionRow = {
  id: string;
  token: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  isCurrent: boolean;
};

export async function listMySessions(): Promise<SessionRow[]> {
  const authSession = await requireSession();
  const rows = await db
    .select()
    .from(sessionTable)
    .where(
      and(
        eq(sessionTable.userId, authSession.user.id),
        gt(sessionTable.expiresAt, new Date())
      )
    )
    .orderBy(desc(sessionTable.updatedAt));

  return rows.map((s) => ({
    id: s.id,
    token: s.token,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
    expiresAt: s.expiresAt,
    ipAddress: s.ipAddress,
    userAgent: s.userAgent,
    isCurrent: s.token === authSession.session.token,
  }));
}

export async function revokeSession(token: string) {
  const authSession = await requireSession();
  if (!token) return { error: "Missing session" };
  if (token === authSession.session.token) {
    return {
      error: "You can’t revoke the session you’re using. Sign out instead.",
    };
  }

  const row = await db.query.session.findFirst({
    where: and(
      eq(sessionTable.token, token),
      eq(sessionTable.userId, authSession.user.id)
    ),
  });
  if (!row) return { error: "Session not found" };

  await db.delete(sessionTable).where(eq(sessionTable.token, token));
  revalidatePath("/account");
  return { ok: true as const };
}

export async function revokeOtherSessions() {
  const authSession = await requireSession();

  await db
    .delete(sessionTable)
    .where(
      and(
        eq(sessionTable.userId, authSession.user.id),
        ne(sessionTable.token, authSession.session.token)
      )
    );

  revalidatePath("/account");
  return { ok: true as const };
}

export async function getAccountContext() {
  const { user: sessionUser, organization, role, session } =
    await requireMembership();

  // Prefer DB row so createdAt / emailVerified are authoritative
  const dbUser = await db.query.user.findFirst({
    where: eq(user.id, sessionUser.id),
  });

  const sessions = await listMySessions();
  return {
    user: {
      id: sessionUser.id,
      name: dbUser?.name ?? sessionUser.name,
      email: dbUser?.email ?? sessionUser.email,
      image: dbUser?.image ?? sessionUser.image ?? null,
      emailVerified: dbUser?.emailVerified ?? sessionUser.emailVerified,
      createdAt: dbUser?.createdAt ?? new Date(),
    },
    organization: {
      id: organization.id,
      name: organization.name,
    },
    role,
    currentSessionToken: session.session.token,
    sessions,
  };
}
