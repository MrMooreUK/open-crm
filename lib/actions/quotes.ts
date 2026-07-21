"use server";

import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { enquiries, quoteItems, quotes } from "@/lib/db/schema";
import { createId } from "@/lib/id";
import { requireMembership } from "@/lib/session";
import { quoteSchema } from "@/lib/validations";
import {
  computeQuoteTotals,
  lineAmountCents,
  percentToBps,
  quantityToMillis,
} from "@/lib/quotes/math";

export async function listQuotes() {
  const { organizationId } = await requireMembership();
  return db.query.quotes.findMany({
    where: eq(quotes.organizationId, organizationId),
    orderBy: [desc(quotes.createdAt)],
    with: {
      company: true,
      contact: true,
      enquiry: true,
      deal: true,
    },
  });
}

export async function getQuote(id: string) {
  const { organizationId } = await requireMembership();
  return db.query.quotes.findFirst({
    where: and(eq(quotes.id, id), eq(quotes.organizationId, organizationId)),
    with: {
      company: true,
      contact: true,
      enquiry: true,
      deal: true,
      createdBy: true,
      items: {
        orderBy: (i, { asc }) => [asc(i.position)],
      },
      organization: true,
    },
  });
}

async function nextQuoteNumber(organizationId: string) {
  const year = new Date().getFullYear();
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(quotes)
    .where(eq(quotes.organizationId, organizationId));
  const n = (row?.count ?? 0) + 1;
  return `Q-${year}-${String(n).padStart(4, "0")}`;
}

function parseLinesFromForm(formData: FormData) {
  const descriptions = formData.getAll("lineDescription").map(String);
  const quantities = formData.getAll("lineQuantity").map(String);
  const unitPrices = formData.getAll("lineUnitPrice").map(String);

  const lines = descriptions.map((description, i) => ({
    description: description.trim(),
    quantity: Number(quantities[i] || 1),
    unitPrice: Number(unitPrices[i] || 0),
  }));

  return lines.filter((l) => l.description);
}

function parseQuoteForm(formData: FormData) {
  return quoteSchema.safeParse({
    title: formData.get("title"),
    status: formData.get("status") || "draft",
    currency: formData.get("currency") || "USD",
    taxPercent: formData.get("taxPercent") || 0,
    validUntil: formData.get("validUntil") || "",
    notes: formData.get("notes") || "",
    terms: formData.get("terms") || "",
    enquiryId: formData.get("enquiryId") || "",
    dealId: formData.get("dealId") || "",
    companyId: formData.get("companyId") || "",
    contactId: formData.get("contactId") || "",
    billToName: formData.get("billToName") || "",
    billToEmail: formData.get("billToEmail") || "",
    billToCompany: formData.get("billToCompany") || "",
    billToAddress: formData.get("billToAddress") || "",
    lines: parseLinesFromForm(formData),
  });
}

export async function createQuote(formData: FormData) {
  const { organizationId, user, organization } = await requireMembership();
  const parsed = parseQuoteForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const taxBps = percentToBps(parsed.data.taxPercent);
  const lineRows = parsed.data.lines.map((l, i) => {
    const quantityMillis = quantityToMillis(l.quantity);
    const unitPriceCents = Math.round(l.unitPrice * 100);
    return {
      id: createId("qli"),
      position: i,
      description: l.description,
      quantityMillis,
      unitPriceCents,
      amountCents: lineAmountCents(quantityMillis, unitPriceCents),
    };
  });

  const totals = computeQuoteTotals(lineRows, taxBps);
  const id = createId("quo");
  const number = await nextQuoteNumber(organizationId);

  const currency = parsed.data.currency || organization.currency || "USD";

  await db.insert(quotes).values({
    id,
    organizationId,
    number,
    title: parsed.data.title,
    status: parsed.data.status,
    currency,
    taxBps,
    ...totals,
    validUntil: parsed.data.validUntil
      ? new Date(parsed.data.validUntil)
      : null,
    notes: parsed.data.notes || null,
    terms: parsed.data.terms || null,
    enquiryId: parsed.data.enquiryId || null,
    dealId: parsed.data.dealId || null,
    companyId: parsed.data.companyId || null,
    contactId: parsed.data.contactId || null,
    billToName: parsed.data.billToName || null,
    billToEmail: parsed.data.billToEmail || null,
    billToCompany: parsed.data.billToCompany || null,
    billToAddress: parsed.data.billToAddress || null,
    createdById: user.id,
    sentAt: parsed.data.status === "sent" ? new Date() : null,
  });

  await db.insert(quoteItems).values(
    lineRows.map((l) => ({
      ...l,
      quoteId: id,
    }))
  );

  if (parsed.data.enquiryId) {
    await db
      .update(enquiries)
      .set({ status: "quoted", updatedAt: new Date() })
      .where(
        and(
          eq(enquiries.id, parsed.data.enquiryId),
          eq(enquiries.organizationId, organizationId)
        )
      );
    revalidatePath(`/enquiries/${parsed.data.enquiryId}`);
  }

  revalidatePath("/quotes");
  revalidatePath("/enquiries");
  revalidatePath("/");
  return { id };
}

export async function updateQuote(id: string, formData: FormData) {
  const { organizationId } = await requireMembership();
  const existing = await getQuote(id);
  if (!existing) return { error: "Quote not found" };

  const parsed = parseQuoteForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const taxBps = percentToBps(parsed.data.taxPercent);
  const lineRows = parsed.data.lines.map((l, i) => {
    const quantityMillis = quantityToMillis(l.quantity);
    const unitPriceCents = Math.round(l.unitPrice * 100);
    return {
      id: createId("qli"),
      position: i,
      description: l.description,
      quantityMillis,
      unitPriceCents,
      amountCents: lineAmountCents(quantityMillis, unitPriceCents),
    };
  });
  const totals = computeQuoteTotals(lineRows, taxBps);

  const becameSent =
    parsed.data.status === "sent" && existing.status !== "sent";

  await db
    .update(quotes)
    .set({
      title: parsed.data.title,
      status: parsed.data.status,
      currency: parsed.data.currency,
      taxBps,
      ...totals,
      validUntil: parsed.data.validUntil
        ? new Date(parsed.data.validUntil)
        : null,
      notes: parsed.data.notes || null,
      terms: parsed.data.terms || null,
      enquiryId: parsed.data.enquiryId || null,
      dealId: parsed.data.dealId || null,
      companyId: parsed.data.companyId || null,
      contactId: parsed.data.contactId || null,
      billToName: parsed.data.billToName || null,
      billToEmail: parsed.data.billToEmail || null,
      billToCompany: parsed.data.billToCompany || null,
      billToAddress: parsed.data.billToAddress || null,
      sentAt: becameSent ? new Date() : existing.sentAt,
      updatedAt: new Date(),
    })
    .where(and(eq(quotes.id, id), eq(quotes.organizationId, organizationId)));

  await db.delete(quoteItems).where(eq(quoteItems.quoteId, id));
  await db.insert(quoteItems).values(
    lineRows.map((l) => ({
      ...l,
      quoteId: id,
    }))
  );

  revalidatePath("/quotes");
  revalidatePath(`/quotes/${id}`);
  revalidatePath(`/quotes/${id}/print`);
  return { ok: true };
}

export async function deleteQuote(id: string) {
  const { organizationId } = await requireMembership();
  await db
    .delete(quotes)
    .where(and(eq(quotes.id, id), eq(quotes.organizationId, organizationId)));
  revalidatePath("/quotes");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteQuotes(ids: string[]) {
  const { organizationId } = await requireMembership();
  const unique = [...new Set(ids.filter(Boolean))];
  if (unique.length === 0) return { error: "Nothing selected" };

  await db
    .delete(quotes)
    .where(
      and(
        eq(quotes.organizationId, organizationId),
        inArray(quotes.id, unique)
      )
    );

  revalidatePath("/quotes");
  revalidatePath("/");
  return { ok: true as const, deleted: unique.length };
}

export async function updateQuoteStatus(
  id: string,
  status: "draft" | "sent" | "accepted" | "rejected" | "expired"
) {
  const { organizationId } = await requireMembership();
  const existing = await getQuote(id);
  if (!existing) return { error: "Not found" };

  await db
    .update(quotes)
    .set({
      status,
      sentAt:
        status === "sent" && !existing.sentAt ? new Date() : existing.sentAt,
      updatedAt: new Date(),
    })
    .where(and(eq(quotes.id, id), eq(quotes.organizationId, organizationId)));

  if (status === "accepted" && existing.enquiryId) {
    await db
      .update(enquiries)
      .set({ status: "won", updatedAt: new Date() })
      .where(
        and(
          eq(enquiries.id, existing.enquiryId),
          eq(enquiries.organizationId, organizationId)
        )
      );
  }

  revalidatePath("/quotes");
  revalidatePath(`/quotes/${id}`);
  revalidatePath("/enquiries");
  return { ok: true };
}

/** Clone a quote as a new draft with a fresh number */
export async function duplicateQuote(id: string) {
  const { organizationId, user } = await requireMembership();
  const existing = await getQuote(id);
  if (!existing || existing.organizationId !== organizationId) {
    return { error: "Quote not found" };
  }

  const newId = createId("quo");
  const number = await nextQuoteNumber(organizationId);
  const { addDaysISO } = await import("@/lib/quotes/defaults");

  await db.insert(quotes).values({
    id: newId,
    organizationId,
    number,
    title: `${existing.title} (copy)`,
    status: "draft",
    currency: existing.currency,
    taxBps: existing.taxBps,
    subtotalCents: existing.subtotalCents,
    taxCents: existing.taxCents,
    totalCents: existing.totalCents,
    validUntil: new Date(addDaysISO(30)),
    notes: existing.notes,
    terms: existing.terms,
    enquiryId: existing.enquiryId,
    dealId: existing.dealId,
    companyId: existing.companyId,
    contactId: existing.contactId,
    billToName: existing.billToName,
    billToEmail: existing.billToEmail,
    billToCompany: existing.billToCompany,
    billToAddress: existing.billToAddress,
    createdById: user.id,
  });

  if (existing.items.length) {
    await db.insert(quoteItems).values(
      existing.items.map((item, i) => ({
        id: createId("qli"),
        quoteId: newId,
        position: i,
        description: item.description,
        quantityMillis: item.quantityMillis,
        unitPriceCents: item.unitPriceCents,
        amountCents: item.amountCents,
      }))
    );
  }

  revalidatePath("/quotes");
  return { id: newId };
}
