import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  organizationName: z.string().min(1, "Organization name is required").max(100),
});

export const userProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
    revokeOtherSessions: z
      .union([z.literal("on"), z.literal("true"), z.boolean(), z.literal("")])
      .optional()
      .transform((v) => v === true || v === "on" || v === "true"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
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
  /** Assigned team member (user id) */
  ownerId: z.string().optional().or(z.literal("")),
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

export const orgProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  legalName: z.string().max(200).optional().or(z.literal("")),
  email: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || z.string().email().safeParse(v).success, {
      message: "Invalid email",
    }),
  phone: z.string().max(50).optional().or(z.literal("")),
  website: z.string().max(300).optional().or(z.literal("")),
  addressLine1: z.string().max(300).optional().or(z.literal("")),
  addressLine2: z.string().max(300).optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  region: z.string().max(100).optional().or(z.literal("")),
  postalCode: z.string().max(30).optional().or(z.literal("")),
  country: z.string().max(100).optional().or(z.literal("")),
  taxId: z.string().max(100).optional().or(z.literal("")),
  quoteFooter: z.string().max(2000).optional().or(z.literal("")),
});

export const orgRegionalSchema = z.object({
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

/** Full org settings (profile + regional) */
export const orgSettingsSchema = orgProfileSchema.merge(orgRegionalSchema);

export const enquirySchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  status: z
    .enum(["new", "in_progress", "quoted", "won", "lost", "closed"])
    .default("new"),
  source: z
    .enum(["web", "email", "phone", "referral", "other"])
    .default("other"),
  message: z.string().max(10000).optional().or(z.literal("")),
  contactName: z.string().max(200).optional().or(z.literal("")),
  contactEmail: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || z.string().email().safeParse(v).success, {
      message: "Invalid email",
    }),
  contactPhone: z.string().max(50).optional().or(z.literal("")),
  companyId: z.string().optional().or(z.literal("")),
  contactId: z.string().optional().or(z.literal("")),
  /** Assigned team member (user id) */
  ownerId: z.string().optional().or(z.literal("")),
});

export const quoteLineSchema = z.object({
  description: z.string().min(1, "Line description required").max(500),
  quantity: z.coerce.number().positive().default(1),
  unitPrice: z.coerce.number().min(0).default(0),
});

export const quoteSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  status: z
    .enum(["draft", "sent", "accepted", "rejected", "expired"])
    .default("draft"),
  currency: z.string().length(3).default("USD"),
  taxPercent: z.coerce.number().min(0).max(100).default(0),
  validUntil: z.string().optional().or(z.literal("")),
  notes: z.string().max(5000).optional().or(z.literal("")),
  terms: z.string().max(5000).optional().or(z.literal("")),
  enquiryId: z.string().optional().or(z.literal("")),
  dealId: z.string().optional().or(z.literal("")),
  companyId: z.string().optional().or(z.literal("")),
  contactId: z.string().optional().or(z.literal("")),
  billToName: z.string().max(200).optional().or(z.literal("")),
  billToEmail: z.string().optional().or(z.literal("")),
  billToCompany: z.string().max(200).optional().or(z.literal("")),
  billToAddress: z.string().max(500).optional().or(z.literal("")),
  lines: z.array(quoteLineSchema).min(1, "Add at least one line item"),
});
