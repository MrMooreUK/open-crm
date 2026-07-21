import type { DataTableBulkAction } from "./types";

/** Shared delete bulk-action factory used by every list table. */
export function makeBulkDeleteAction(
  resource: { singular: string; plural: string },
  deleteMany: (
    ids: string[]
  ) => Promise<{ error?: string; ok?: boolean } | void>
): DataTableBulkAction {
  return {
    id: "delete",
    label: "Delete",
    variant: "destructive",
    confirm: (count) =>
      `Delete ${count} ${count === 1 ? resource.singular : resource.plural}? This cannot be undone.`,
    onAction: deleteMany,
  };
}
