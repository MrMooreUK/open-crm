ALTER TABLE "organizations" ADD COLUMN "timezone" text DEFAULT 'UTC' NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "currency" text DEFAULT 'USD' NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "locale" text DEFAULT 'en-US' NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "date_format" text DEFAULT 'medium' NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "week_starts_on" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "fiscal_year_start_month" integer DEFAULT 1 NOT NULL;