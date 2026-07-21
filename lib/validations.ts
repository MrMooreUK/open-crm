import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  organizationName: z.string().min(1, "Organization name is required").max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const companySchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  domain: z.string().max(200).optional().or(z.literal("")),
  industry: z.string().max(100).optional().or(z.literal("")),
  website: z.string().max(300).optional().or(z.literal("")),
  notes: z.string().max(5000).optional().or(z.literal("")),
});

export const contactSchema = z.object({
  firstName: z.string().min(1, "Name is required").max(100),
  lastName: z.string().max(100).optional().or(z.literal("")),
  email: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || z.string().email().safeParse(v).success, {
      message: "Invalid email",
    }),
  phone: z.string().max(50).optional().or(z.literal("")),
  title: z.string().max(100).optional().or(z.literal("")),
  companyId: z.string().optional().or(z.literal("")),
  notes: z.string().max(5000).optional().or(z.literal("")),
});

export const dealSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  amount: z.coerce.number().min(0).default(0),
  currency: z.string().default("USD"),
  stageId: z.string().min(1, "Stage is required"),
  companyId: z.string().optional().or(z.literal("")),
  contactId: z.string().optional().or(z.literal("")),
  expectedCloseAt: z.string().optional().or(z.literal("")),
  notes: z.string().max(5000).optional().or(z.literal("")),
});

export const activitySchema = z.object({
  type: z.enum(["note", "call", "email", "meeting", "task"]),
  body: z.string().min(1, "Content is required").max(5000),
  dueAt: z.string().optional().or(z.literal("")),
  companyId: z.string().optional().or(z.literal("")),
  contactId: z.string().optional().or(z.literal("")),
  dealId: z.string().optional().or(z.literal("")),
});

export const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["owner", "member"]).default("member"),
});

export const orgSettingsSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  timezone: z.string().min(1).max(64),
  currency: z
    .string()
    .length(3, "Currency must be a 3-letter code")
    .transform((v) => v.toUpperCase()),
  locale: z.string().min(2).max(16),
  dateFormat: z.enum(["short", "medium", "long", "full"]),
  weekStartsOn: z.coerce.number().int().min(0).max(6),
  fiscalYearStartMonth: z.coerce.number().int().min(1).max(12),
});
