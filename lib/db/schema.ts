import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ─── Better Auth tables ───────────────────────────────────────────────────────

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => [index("session_user_id_idx").on(t.userId)]
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("account_user_id_idx").on(t.userId)]
);

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── CRM enums ────────────────────────────────────────────────────────────────

export const memberRoleEnum = pgEnum("member_role", ["owner", "member"]);
export const activityTypeEnum = pgEnum("activity_type", [
  "note",
  "call",
  "email",
  "meeting",
  "task",
]);
export const enquiryStatusEnum = pgEnum("enquiry_status", [
  "new",
  "in_progress",
  "quoted",
  "won",
  "lost",
  "closed",
]);
export const enquirySourceEnum = pgEnum("enquiry_source", [
  "web",
  "email",
  "phone",
  "referral",
  "other",
]);
export const quoteStatusEnum = pgEnum("quote_status", [
  "draft",
  "sent",
  "accepted",
  "rejected",
  "expired",
]);

// ─── Organizations & membership ───────────────────────────────────────────────

export const organizations = pgTable(
  "organizations",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    /** IANA timezone, e.g. America/New_York */
    timezone: text("timezone").notNull().default("UTC"),
    /** Default ISO 4217 currency for new deals, e.g. USD */
    currency: text("currency").notNull().default("USD"),
    /** BCP 47 locale for number/date formatting, e.g. en-US */
    locale: text("locale").notNull().default("en-US"),
    /** Date display style */
    dateFormat: text("date_format").notNull().default("medium"),
    /** 0 = Sunday, 1 = Monday */
    weekStartsOn: integer("week_starts_on").notNull().default(1),
    /** 1–12, fiscal year start month */
    fiscalYearStartMonth: integer("fiscal_year_start_month")
      .notNull()
      .default(1),
    // ── Company / branding (quotes & documents) ───────────────────────────
    legalName: text("legal_name"),
    email: text("email"),
    phone: text("phone"),
    website: text("website"),
    addressLine1: text("address_line1"),
    addressLine2: text("address_line2"),
    city: text("city"),
    region: text("region"),
    postalCode: text("postal_code"),
    country: text("country"),
    taxId: text("tax_id"),
    /** Public path e.g. /uploads/logos/org_xxx.png */
    logoUrl: text("logo_url"),
    /** Optional footer shown on quotes */
    quoteFooter: text("quote_footer"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("organizations_slug_uidx").on(t.slug)]
);

export const members = pgTable(
  "members",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: memberRoleEnum("role").notNull().default("member"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("members_org_user_uidx").on(t.organizationId, t.userId),
    index("members_user_id_idx").on(t.userId),
  ]
);

export const invites = pgTable(
  "invites",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: memberRoleEnum("role").notNull().default("member"),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    createdById: text("created_by_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("invites_org_id_idx").on(t.organizationId)]
);

// ─── CRM entities ─────────────────────────────────────────────────────────────

export const companies = pgTable(
  "companies",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    domain: text("domain"),
    industry: text("industry"),
    website: text("website"),
    notes: text("notes"),
    ownerId: text("owner_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("companies_org_id_idx").on(t.organizationId),
    index("companies_name_idx").on(t.organizationId, t.name),
  ]
);

export const contacts = pgTable(
  "contacts",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull().default(""),
    email: text("email"),
    phone: text("phone"),
    title: text("title"),
    companyId: text("company_id").references(() => companies.id, {
      onDelete: "set null",
    }),
    ownerId: text("owner_id").references(() => user.id, {
      onDelete: "set null",
    }),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("contacts_org_id_idx").on(t.organizationId),
    index("contacts_company_id_idx").on(t.companyId),
    index("contacts_email_idx").on(t.organizationId, t.email),
  ]
);

export const pipelines = pgTable(
  "pipelines",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull().default("Sales"),
    isDefault: boolean("is_default").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("pipelines_org_id_idx").on(t.organizationId)]
);

export const stages = pgTable(
  "stages",
  {
    id: text("id").primaryKey(),
    pipelineId: text("pipeline_id")
      .notNull()
      .references(() => pipelines.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    position: integer("position").notNull().default(0),
    isWon: boolean("is_won").notNull().default(false),
    isLost: boolean("is_lost").notNull().default(false),
  },
  (t) => [index("stages_pipeline_id_idx").on(t.pipelineId)]
);

export const deals = pgTable(
  "deals",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    amountCents: integer("amount_cents").notNull().default(0),
    currency: text("currency").notNull().default("USD"),
    stageId: text("stage_id")
      .notNull()
      .references(() => stages.id, { onDelete: "restrict" }),
    companyId: text("company_id").references(() => companies.id, {
      onDelete: "set null",
    }),
    contactId: text("contact_id").references(() => contacts.id, {
      onDelete: "set null",
    }),
    ownerId: text("owner_id").references(() => user.id, {
      onDelete: "set null",
    }),
    expectedCloseAt: timestamp("expected_close_at"),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("deals_org_id_idx").on(t.organizationId),
    index("deals_stage_id_idx").on(t.stageId),
    index("deals_company_id_idx").on(t.companyId),
  ]
);

export const activities = pgTable(
  "activities",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    type: activityTypeEnum("type").notNull().default("note"),
    body: text("body").notNull().default(""),
    dueAt: timestamp("due_at"),
    completedAt: timestamp("completed_at"),
    companyId: text("company_id").references(() => companies.id, {
      onDelete: "cascade",
    }),
    contactId: text("contact_id").references(() => contacts.id, {
      onDelete: "cascade",
    }),
    dealId: text("deal_id").references(() => deals.id, {
      onDelete: "cascade",
    }),
    createdById: text("created_by_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("activities_org_id_idx").on(t.organizationId),
    index("activities_deal_id_idx").on(t.dealId),
    index("activities_contact_id_idx").on(t.contactId),
    index("activities_company_id_idx").on(t.companyId),
    index("activities_due_at_idx").on(t.dueAt),
  ]
);

// ─── Enquiries & quotes ───────────────────────────────────────────────────────

export const enquiries = pgTable(
  "enquiries",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    status: enquiryStatusEnum("status").notNull().default("new"),
    source: enquirySourceEnum("source").notNull().default("other"),
    message: text("message"),
    /** Denormalized when no CRM contact yet */
    contactName: text("contact_name"),
    contactEmail: text("contact_email"),
    contactPhone: text("contact_phone"),
    companyId: text("company_id").references(() => companies.id, {
      onDelete: "set null",
    }),
    contactId: text("contact_id").references(() => contacts.id, {
      onDelete: "set null",
    }),
    dealId: text("deal_id").references(() => deals.id, {
      onDelete: "set null",
    }),
    ownerId: text("owner_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("enquiries_org_id_idx").on(t.organizationId),
    index("enquiries_status_idx").on(t.organizationId, t.status),
    index("enquiries_company_id_idx").on(t.companyId),
  ]
);

export const quotes = pgTable(
  "quotes",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    number: text("number").notNull(),
    title: text("title").notNull(),
    status: quoteStatusEnum("status").notNull().default("draft"),
    currency: text("currency").notNull().default("USD"),
    /** Tax rate as basis points, e.g. 2000 = 20% */
    taxBps: integer("tax_bps").notNull().default(0),
    subtotalCents: integer("subtotal_cents").notNull().default(0),
    taxCents: integer("tax_cents").notNull().default(0),
    totalCents: integer("total_cents").notNull().default(0),
    validUntil: timestamp("valid_until"),
    notes: text("notes"),
    terms: text("terms"),
    enquiryId: text("enquiry_id").references(() => enquiries.id, {
      onDelete: "set null",
    }),
    dealId: text("deal_id").references(() => deals.id, {
      onDelete: "set null",
    }),
    companyId: text("company_id").references(() => companies.id, {
      onDelete: "set null",
    }),
    contactId: text("contact_id").references(() => contacts.id, {
      onDelete: "set null",
    }),
    /** Bill-to snapshot for printable quotes */
    billToName: text("bill_to_name"),
    billToEmail: text("bill_to_email"),
    billToCompany: text("bill_to_company"),
    billToAddress: text("bill_to_address"),
    createdById: text("created_by_id").references(() => user.id, {
      onDelete: "set null",
    }),
    sentAt: timestamp("sent_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("quotes_org_number_uidx").on(t.organizationId, t.number),
    index("quotes_org_id_idx").on(t.organizationId),
    index("quotes_enquiry_id_idx").on(t.enquiryId),
    index("quotes_deal_id_idx").on(t.dealId),
  ]
);

export const quoteItems = pgTable(
  "quote_items",
  {
    id: text("id").primaryKey(),
    quoteId: text("quote_id")
      .notNull()
      .references(() => quotes.id, { onDelete: "cascade" }),
    position: integer("position").notNull().default(0),
    description: text("description").notNull(),
    /** Quantity in thousandths (1.5 → 1500) for 3 decimal places */
    quantityMillis: integer("quantity_millis").notNull().default(1000),
    unitPriceCents: integer("unit_price_cents").notNull().default(0),
    amountCents: integer("amount_cents").notNull().default(0),
    serviceId: text("service_id"),
  },
  (t) => [index("quote_items_quote_id_idx").on(t.quoteId)]
);

/** Catalog of sellable services with default rates (speeds up quoting) */
export const services = pgTable(
  "services",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    /** Default unit price in cents */
    unitPriceCents: integer("unit_price_cents").notNull().default(0),
    /** hour | day | item | project | month */
    unit: text("unit").notNull().default("item"),
    currency: text("currency").notNull().default("USD"),
    isActive: boolean("is_active").notNull().default(true),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("services_org_id_idx").on(t.organizationId),
    index("services_org_active_idx").on(t.organizationId, t.isActive),
  ]
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const userRelations = relations(user, ({ many }) => ({
  members: many(members),
  sessions: many(session),
  accounts: many(account),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(members),
  companies: many(companies),
  contacts: many(contacts),
  pipelines: many(pipelines),
  deals: many(deals),
  activities: many(activities),
  invites: many(invites),
  enquiries: many(enquiries),
  quotes: many(quotes),
  services: many(services),
}));

export const membersRelations = relations(members, ({ one }) => ({
  organization: one(organizations, {
    fields: [members.organizationId],
    references: [organizations.id],
  }),
  user: one(user, {
    fields: [members.userId],
    references: [user.id],
  }),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [companies.organizationId],
    references: [organizations.id],
  }),
  owner: one(user, {
    fields: [companies.ownerId],
    references: [user.id],
  }),
  contacts: many(contacts),
  deals: many(deals),
  activities: many(activities),
  enquiries: many(enquiries),
  quotes: many(quotes),
}));

export const contactsRelations = relations(contacts, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [contacts.organizationId],
    references: [organizations.id],
  }),
  company: one(companies, {
    fields: [contacts.companyId],
    references: [companies.id],
  }),
  owner: one(user, {
    fields: [contacts.ownerId],
    references: [user.id],
  }),
  deals: many(deals),
  activities: many(activities),
  enquiries: many(enquiries),
  quotes: many(quotes),
}));

export const pipelinesRelations = relations(pipelines, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [pipelines.organizationId],
    references: [organizations.id],
  }),
  stages: many(stages),
}));

export const stagesRelations = relations(stages, ({ one, many }) => ({
  pipeline: one(pipelines, {
    fields: [stages.pipelineId],
    references: [pipelines.id],
  }),
  deals: many(deals),
}));

export const dealsRelations = relations(deals, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [deals.organizationId],
    references: [organizations.id],
  }),
  stage: one(stages, {
    fields: [deals.stageId],
    references: [stages.id],
  }),
  company: one(companies, {
    fields: [deals.companyId],
    references: [companies.id],
  }),
  contact: one(contacts, {
    fields: [deals.contactId],
    references: [contacts.id],
  }),
  owner: one(user, {
    fields: [deals.ownerId],
    references: [user.id],
  }),
  activities: many(activities),
  quotes: many(quotes),
  enquiries: many(enquiries),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  organization: one(organizations, {
    fields: [activities.organizationId],
    references: [organizations.id],
  }),
  company: one(companies, {
    fields: [activities.companyId],
    references: [companies.id],
  }),
  contact: one(contacts, {
    fields: [activities.contactId],
    references: [contacts.id],
  }),
  deal: one(deals, {
    fields: [activities.dealId],
    references: [deals.id],
  }),
  createdBy: one(user, {
    fields: [activities.createdById],
    references: [user.id],
  }),
}));

export const enquiriesRelations = relations(enquiries, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [enquiries.organizationId],
    references: [organizations.id],
  }),
  company: one(companies, {
    fields: [enquiries.companyId],
    references: [companies.id],
  }),
  contact: one(contacts, {
    fields: [enquiries.contactId],
    references: [contacts.id],
  }),
  deal: one(deals, {
    fields: [enquiries.dealId],
    references: [deals.id],
  }),
  owner: one(user, {
    fields: [enquiries.ownerId],
    references: [user.id],
  }),
  quotes: many(quotes),
}));

export const quotesRelations = relations(quotes, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [quotes.organizationId],
    references: [organizations.id],
  }),
  enquiry: one(enquiries, {
    fields: [quotes.enquiryId],
    references: [enquiries.id],
  }),
  deal: one(deals, {
    fields: [quotes.dealId],
    references: [deals.id],
  }),
  company: one(companies, {
    fields: [quotes.companyId],
    references: [companies.id],
  }),
  contact: one(contacts, {
    fields: [quotes.contactId],
    references: [contacts.id],
  }),
  createdBy: one(user, {
    fields: [quotes.createdById],
    references: [user.id],
  }),
  items: many(quoteItems),
}));

export const quoteItemsRelations = relations(quoteItems, ({ one }) => ({
  quote: one(quotes, {
    fields: [quoteItems.quoteId],
    references: [quotes.id],
  }),
}));

export const servicesRelations = relations(services, ({ one }) => ({
  organization: one(organizations, {
    fields: [services.organizationId],
    references: [organizations.id],
  }),
}));

// Schema export for Better Auth adapter
export const schema = {
  user,
  session,
  account,
  verification,
  organizations,
  members,
  invites,
  companies,
  contacts,
  pipelines,
  stages,
  deals,
  activities,
  enquiries,
  quotes,
  quoteItems,
  services,
};
