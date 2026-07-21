/**
 * Shared company ↔ contact linking helpers for create/edit forms.
 */

export type WithCompanyId = {
  companyId?: string | null;
};

/** When a company is selected, only contacts at that company. Otherwise all. */
export function filterContactsByCompany<T extends WithCompanyId>(
  contacts: T[],
  companyId: string | null | undefined
): T[] {
  if (!companyId) return contacts;
  return contacts.filter((c) => c.companyId === companyId);
}

/** True if contact belongs to company (or either side is empty). */
export function contactBelongsToCompany(
  contact: WithCompanyId | undefined,
  companyId: string | null | undefined
): boolean {
  if (!contact || !companyId) return true;
  return contact.companyId === companyId;
}
