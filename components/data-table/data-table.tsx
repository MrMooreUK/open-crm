"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Columns3,
  Filter,
  GripVertical,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type {
  DataTableBulkAction,
  DataTableColumn,
  DataTableResourceLabels,
} from "./types";
import { useTablePrefs } from "./use-table-prefs";

function SortableColumnRow({
  id,
  label,
  checked,
  locked,
  onToggle,
}: {
  id: string;
  label: string;
  checked: boolean;
  locked: boolean;
  onToggle: (checked: boolean) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-1.5 px-2 py-1.5 text-sm hover:bg-zinc-50",
        isDragging && "z-10 rounded-md bg-white shadow-md ring-1 ring-zinc-200",
        locked && "opacity-70"
      )}
    >
      <button
        type="button"
        className="cursor-grab touch-none rounded p-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 active:cursor-grabbing"
        aria-label={`Drag ${label}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>
      <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          className="h-3.5 w-3.5 rounded border-zinc-300"
          checked={checked}
          disabled={locked}
          onChange={(e) => onToggle(e.target.checked)}
        />
        <span className="truncate text-zinc-800">{label}</span>
      </label>
    </div>
  );
}

function SortableHeaderCell<T>({
  col,
  active,
  sortDir,
  onSort,
}: {
  col: DataTableColumn<T>;
  active: boolean;
  sortDir?: "asc" | "desc";
  onSort: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: col.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const sortable = col.sortable !== false;

  return (
    <th
      ref={setNodeRef}
      style={style}
      className={cn(
        "px-2 py-2 whitespace-nowrap",
        isDragging && "z-10 bg-zinc-100 shadow-sm",
        col.className
      )}
    >
      <div className="inline-flex items-center gap-0.5">
        <button
          type="button"
          className="cursor-grab touch-none rounded p-0.5 text-zinc-400 hover:bg-zinc-200/80 hover:text-zinc-600 active:cursor-grabbing"
          aria-label={`Reorder ${col.header}`}
          title="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-3 w-3" />
        </button>
        {sortable ? (
          <button
            type="button"
            className="inline-flex items-center gap-1 hover:text-zinc-800"
            onClick={onSort}
          >
            {col.header}
            {active ? (
              sortDir === "desc" ? (
                <ArrowDown className="h-3 w-3" />
              ) : (
                <ArrowUp className="h-3 w-3" />
              )
            ) : (
              <ArrowUpDown className="h-3 w-3 opacity-40" />
            )}
          </button>
        ) : (
          <span>{col.header}</span>
        )}
      </div>
    </th>
  );
}

function resourceWord(count: number, labels: DataTableResourceLabels) {
  return count === 1 ? labels.singular : labels.plural;
}

export function DataTable<T extends { id: string }>({
  tableId,
  columns,
  rows,
  emptyMessage = "No matching rows",
  searchPlaceholder = "Filter rows…",
  /** Enable row checkboxes + bulk toolbar (on when bulkActions provided) */
  selectable,
  bulkActions = [],
  resourceLabels = { singular: "item", plural: "items" },
}: {
  tableId: string;
  columns: DataTableColumn<T>[];
  rows: T[];
  emptyMessage?: string;
  searchPlaceholder?: string;
  selectable?: boolean;
  bulkActions?: DataTableBulkAction[];
  resourceLabels?: DataTableResourceLabels;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { prefs, setVisible, reorder, toggleSort, reset } = useTablePrefs(
    tableId,
    columns
  );
  const [query, setQuery] = useState("");
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>(
    {}
  );
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const selectionEnabled =
    selectable ?? (bulkActions.length > 0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Drop selection for rows that no longer exist
  useEffect(() => {
    const valid = new Set(rows.map((r) => r.id));
    setSelected((prev) => {
      let changed = false;
      const next = new Set<string>();
      for (const id of prev) {
        if (valid.has(id)) next.add(id);
        else changed = true;
      }
      return changed ? next : prev;
    });
  }, [rows]);

  const orderedColumns = useMemo(() => {
    const byId = new Map(columns.map((c) => [c.id, c]));
    const ordered: DataTableColumn<T>[] = [];
    for (const id of prefs.order) {
      const col = byId.get(id);
      if (col) ordered.push(col);
    }
    for (const col of columns) {
      if (!prefs.order.includes(col.id)) ordered.push(col);
    }
    return ordered;
  }, [columns, prefs.order]);

  const visibleColumns = useMemo(() => {
    const set = new Set(prefs.visible);
    return orderedColumns.filter((c) => set.has(c.id));
  }, [orderedColumns, prefs.visible]);

  const filterableColumns = useMemo(
    () => orderedColumns.filter((c) => c.filterType),
    [orderedColumns]
  );

  const activeFilterCount = useMemo(() => {
    return Object.values(columnFilters).filter((v) => v.trim()).length;
  }, [columnFilters]);

  const processed = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = rows.filter((row) => {
      if (q) {
        const hay = columns
          .map((c) => c.getValue(row))
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }

      for (const [colId, filterVal] of Object.entries(columnFilters)) {
        const fv = filterVal.trim().toLowerCase();
        if (!fv) continue;
        const col = columns.find((c) => c.id === colId);
        if (!col) continue;
        const cell = col.getValue(row).toLowerCase();
        if (col.filterType === "select") {
          if (cell !== fv) return false;
        } else if (!cell.includes(fv)) {
          return false;
        }
      }
      return true;
    });

    if (prefs.sortId) {
      const col = columns.find((c) => c.id === prefs.sortId);
      if (col) {
        const dir = prefs.sortDir === "desc" ? -1 : 1;
        list = [...list].sort((a, b) => {
          const av = col.getValue(a).toLowerCase();
          const bv = col.getValue(b).toLowerCase();
          const an = Number(av.replace(/[^0-9.-]/g, ""));
          const bn = Number(bv.replace(/[^0-9.-]/g, ""));
          if (
            av.replace(/[^0-9.-]/g, "").length > 0 &&
            bv.replace(/[^0-9.-]/g, "").length > 0 &&
            !Number.isNaN(an) &&
            !Number.isNaN(bn) &&
            /[0-9]/.test(av) &&
            /[0-9]/.test(bv)
          ) {
            return (an - bn) * dir;
          }
          return av.localeCompare(bv) * dir;
        });
      }
    }

    return list;
  }, [rows, columns, query, columnFilters, prefs.sortId, prefs.sortDir]);

  const processedIds = useMemo(
    () => processed.map((r) => r.id),
    [processed]
  );

  const allVisibleSelected =
    processedIds.length > 0 &&
    processedIds.every((id) => selected.has(id));
  const someVisibleSelected =
    processedIds.some((id) => selected.has(id)) && !allVisibleSelected;

  const selectedCount = selected.size;
  const selectedIds = useMemo(() => Array.from(selected), [selected]);

  function clearFilters() {
    setQuery("");
    setColumnFilters({});
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    reorder(String(active.id), String(over.id));
  }

  function toggleOne(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function toggleAllVisible(checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) {
        for (const id of processedIds) next.add(id);
      } else {
        for (const id of processedIds) next.delete(id);
      }
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
  }

  async function runBulkAction(action: DataTableBulkAction) {
    if (selectedIds.length === 0) return;

    if (action.confirm) {
      const message =
        typeof action.confirm === "function"
          ? action.confirm(selectedIds.length)
          : action.confirm;
      if (!window.confirm(message)) return;
    }

    setBusyAction(action.id);
    try {
      const result = await action.onAction(selectedIds);
      if (result && "error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(
        action.id === "delete"
          ? `Deleted ${selectedIds.length} ${resourceWord(selectedIds.length, resourceLabels)}`
          : `${action.label} · ${selectedIds.length} ${resourceWord(selectedIds.length, resourceLabels)}`
      );
      clearSelection();
      startTransition(() => {
        router.refresh();
      });
    } catch {
      toast.error(`Could not ${action.label.toLowerCase()}`);
    } finally {
      setBusyAction(null);
    }
  }

  const colSpan =
    visibleColumns.length + (selectionEnabled ? 1 : 0) || 1;

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-8 bg-white pl-8 text-sm"
          />
        </div>

        <div className="relative">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setFiltersOpen((v) => !v);
              setColumnsOpen(false);
            }}
          >
            <Filter className="h-3.5 w-3.5" />
            Filters
            {activeFilterCount > 0 ? (
              <span className="ml-0.5 rounded bg-brand px-1.5 py-0.5 text-[10px] font-medium text-brand-foreground">
                {activeFilterCount}
              </span>
            ) : null}
          </Button>
          {filtersOpen ? (
            <>
              <button
                type="button"
                className="fixed inset-0 z-30 cursor-default"
                aria-label="Close filters"
                onClick={() => setFiltersOpen(false)}
              />
              <div className="absolute right-0 z-40 mt-1 w-72 rounded-md border border-zinc-200 bg-white p-3 shadow-lg">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Column filters
                  </p>
                  <button
                    type="button"
                    className="text-[11px] text-zinc-500 hover:text-zinc-900"
                    onClick={clearFilters}
                  >
                    Clear all
                  </button>
                </div>
                {filterableColumns.length === 0 ? (
                  <p className="text-xs text-zinc-500">
                    No column filters for this table.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {filterableColumns.map((col) => (
                      <div key={col.id} className="space-y-1">
                        <label className="text-xs font-medium text-zinc-600">
                          {col.header}
                        </label>
                        {col.filterType === "select" && col.filterOptions ? (
                          <Select
                            value={columnFilters[col.id] ?? ""}
                            onChange={(e) =>
                              setColumnFilters((prev) => ({
                                ...prev,
                                [col.id]: e.target.value,
                              }))
                            }
                            className="h-8"
                          >
                            <option value="">All</option>
                            {col.filterOptions.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </Select>
                        ) : (
                          <Input
                            value={columnFilters[col.id] ?? ""}
                            onChange={(e) =>
                              setColumnFilters((prev) => ({
                                ...prev,
                                [col.id]: e.target.value,
                              }))
                            }
                            placeholder={`Filter ${col.header.toLowerCase()}…`}
                            className="h-8"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        <div className="relative">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setColumnsOpen((v) => !v);
              setFiltersOpen(false);
            }}
          >
            <Columns3 className="h-3.5 w-3.5" />
            Columns
          </Button>
          {columnsOpen ? (
            <>
              <button
                type="button"
                className="fixed inset-0 z-30 cursor-default"
                aria-label="Close columns"
                onClick={() => setColumnsOpen(false)}
              />
              <div className="absolute right-0 z-40 mt-1 w-60 rounded-md border border-zinc-200 bg-white py-1 shadow-lg">
                <div className="flex items-center justify-between px-3 py-1.5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Columns
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      Drag to reorder
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-[11px] text-zinc-500 hover:text-zinc-900"
                    onClick={reset}
                  >
                    Reset
                  </button>
                </div>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={onDragEnd}
                >
                  <SortableContext
                    items={orderedColumns.map((c) => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {orderedColumns.map((col) => {
                      const checked = prefs.visible.includes(col.id);
                      const locked = col.hideable === false;
                      return (
                        <SortableColumnRow
                          key={col.id}
                          id={col.id}
                          label={col.header}
                          checked={checked}
                          locked={locked}
                          onToggle={(v) => setVisible(col.id, v)}
                        />
                      );
                    })}
                  </SortableContext>
                </DndContext>
              </div>
            </>
          ) : null}
        </div>

        {(query || activeFilterCount > 0) && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}

        <span className="ml-auto text-xs text-zinc-400">
          {processed.length}
          {processed.length !== rows.length ? ` of ${rows.length}` : ""} rows
        </span>
      </div>

      {/* Bulk selection bar — global across all list tables */}
      {selectionEnabled && selectedCount > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2">
          <span className="text-sm font-medium text-zinc-800">
            {selectedCount} {resourceWord(selectedCount, resourceLabels)}{" "}
            selected
          </span>
          <button
            type="button"
            onClick={clearSelection}
            className="text-xs text-zinc-500 hover:text-zinc-800"
          >
            Clear
          </button>
          <div className="ml-auto flex flex-wrap items-center gap-1.5">
            {bulkActions.map((action) => (
              <Button
                key={action.id}
                type="button"
                size="sm"
                variant={action.variant ?? "outline"}
                disabled={pending || busyAction !== null}
                onClick={() => runBulkAction(action)}
              >
                {action.id === "delete" ? (
                  <Trash2 className="h-3.5 w-3.5" />
                ) : null}
                {busyAction === action.id
                  ? "Working…"
                  : action.label}
              </Button>
            ))}
          </div>
        </div>
      ) : null}

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-zinc-200">
        <div className="overflow-x-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 text-xs font-medium uppercase tracking-wide text-zinc-500">
                <tr>
                  {selectionEnabled ? (
                    <th className="w-10 px-3 py-2">
                      <input
                        type="checkbox"
                        className="h-3.5 w-3.5 rounded border-zinc-300"
                        checked={allVisibleSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = someVisibleSelected;
                        }}
                        onChange={(e) => toggleAllVisible(e.target.checked)}
                        aria-label={`Select all ${resourceLabels.plural}`}
                        disabled={processedIds.length === 0}
                      />
                    </th>
                  ) : null}
                  <SortableContext
                    items={visibleColumns.map((c) => c.id)}
                    strategy={horizontalListSortingStrategy}
                  >
                    {visibleColumns.map((col) => (
                      <SortableHeaderCell
                        key={col.id}
                        col={col}
                        active={prefs.sortId === col.id}
                        sortDir={prefs.sortDir}
                        onSort={() => toggleSort(col.id)}
                      />
                    ))}
                  </SortableContext>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {processed.length === 0 ? (
                  <tr>
                    <td
                      colSpan={colSpan}
                      className="px-3 py-10 text-center text-sm text-zinc-500"
                    >
                      {emptyMessage}
                    </td>
                  </tr>
                ) : (
                  processed.map((row) => {
                    const isSelected = selected.has(row.id);
                    return (
                      <tr
                        key={row.id}
                        className={cn(
                          "hover:bg-zinc-50/80",
                          isSelected && "bg-zinc-50"
                        )}
                      >
                        {selectionEnabled ? (
                          <td className="w-10 px-3 py-2.5">
                            <input
                              type="checkbox"
                              className="h-3.5 w-3.5 rounded border-zinc-300"
                              checked={isSelected}
                              onChange={(e) =>
                                toggleOne(row.id, e.target.checked)
                              }
                              aria-label={`Select ${resourceLabels.singular}`}
                            />
                          </td>
                        ) : null}
                        {visibleColumns.map((col) => (
                          <td
                            key={col.id}
                            className={cn(
                              "px-3 py-2.5 text-zinc-600",
                              col.className
                            )}
                          >
                            {col.cell(row)}
                          </td>
                        ))}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </DndContext>
        </div>
      </div>
    </div>
  );
}
