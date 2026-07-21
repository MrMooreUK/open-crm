import type { ReactNode } from "react";

export type ColumnFilterType = "text" | "select";

export type DataTableColumn<T> = {
  id: string;
  header: string;
  /** String used for filtering / sorting */
  getValue: (row: T) => string;
  /** Render cell content */
  cell: (row: T) => ReactNode;
  /** Show by default (default true) */
  defaultVisible?: boolean;
  /** Allow hiding (default true). Primary columns can set false. */
  hideable?: boolean;
  /** Enable sorting (default true) */
  sortable?: boolean;
  filterType?: ColumnFilterType;
  /** For select filters */
  filterOptions?: { label: string; value: string }[];
  /** Optional class on th/td */
  className?: string;
};

export type DataTablePrefs = {
  /** Column ids currently shown (order follows `order`) */
  visible: string[];
  /** Full column order (all known columns) */
  order: string[];
  sortId?: string;
  sortDir?: "asc" | "desc";
};

/**
 * Bulk action for the global selection toolbar (delete, etc.).
 * Wired the same way on every list that uses DataTable.
 */
export type DataTableBulkAction = {
  id: string;
  label: string;
  /** Button style — destructive for delete */
  variant?: "default" | "secondary" | "outline" | "destructive" | "ghost";
  /** Confirm dialog. Receives selected count. Return false to cancel. */
  confirm?: string | ((count: number) => string);
  /** Run for the selected ids */
  onAction: (
    ids: string[]
  ) => Promise<{ error?: string; ok?: boolean } | void>;
};

/** Labels used in bulk UI (“3 contacts selected”) */
export type DataTableResourceLabels = {
  singular: string;
  plural: string;
};
