"use client";

import { useCallback, useMemo, useState } from "react";
import type { DataTableColumn, DataTablePrefs } from "./types";

function storageKey(tableId: string) {
  return `open-crm.table.${tableId}`;
}

function defaultVisibleIds<T>(columns: DataTableColumn<T>[]): string[] {
  return columns
    .filter((c) => c.defaultVisible !== false)
    .map((c) => c.id);
}

function defaultOrderIds<T>(columns: DataTableColumn<T>[]): string[] {
  return columns.map((c) => c.id);
}

function mergeOrder(saved: string[] | undefined, allIds: string[]): string[] {
  const valid = new Set(allIds);
  const fromSaved = (saved || []).filter((id) => valid.has(id));
  const missing = allIds.filter((id) => !fromSaved.includes(id));
  return [...fromSaved, ...missing];
}

function loadPrefs<T>(
  tableId: string,
  columns: DataTableColumn<T>[],
  defaultsVisible: string[],
  defaultsOrder: string[]
): DataTablePrefs {
  const base: DataTablePrefs = {
    visible: defaultsVisible,
    order: defaultsOrder,
    sortId: undefined,
    sortDir: "asc",
  };

  if (typeof window === "undefined") return base;

  try {
    const raw = localStorage.getItem(storageKey(tableId));
    if (!raw) return base;

    const parsed = JSON.parse(raw) as Partial<DataTablePrefs>;
    const validIds = new Set(columns.map((c) => c.id));
    const order = mergeOrder(parsed.order, defaultsOrder);

    // Prefer visible in order sequence; fall back to saved visible filtered
    let visible = (parsed.visible || [])
      .filter((id) => validIds.has(id))
      .filter((id) => order.includes(id));

    // Keep visible ordered by `order`
    visible = order.filter((id) => visible.includes(id));

    if (!visible.length) {
      visible = order.filter((id) => defaultsVisible.includes(id));
    }
    if (!visible.length) {
      visible = [order[0]].filter(Boolean);
    }

    return {
      visible,
      order,
      sortId:
        parsed.sortId && validIds.has(parsed.sortId)
          ? parsed.sortId
          : undefined,
      sortDir: parsed.sortDir === "desc" ? "desc" : "asc",
    };
  } catch {
    return base;
  }
}

function persist(tableId: string, next: DataTablePrefs) {
  try {
    localStorage.setItem(storageKey(tableId), JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function useTablePrefs<T>(
  tableId: string,
  columns: DataTableColumn<T>[]
) {
  const defaultsVisible = useMemo(
    () => defaultVisibleIds(columns),
    [columns]
  );
  const defaultsOrder = useMemo(() => defaultOrderIds(columns), [columns]);

  const [prefs, setPrefs] = useState<DataTablePrefs>(() =>
    loadPrefs(tableId, columns, defaultsVisible, defaultsOrder)
  );

  const write = useCallback(
    (next: DataTablePrefs) => {
      setPrefs(next);
      persist(tableId, next);
    },
    [tableId]
  );

  const setVisible = useCallback(
    (id: string, visible: boolean) => {
      const col = columns.find((c) => c.id === id);
      if (col?.hideable === false && !visible) return;

      setPrefs((prev) => {
        let nextVisible = visible
          ? prev.visible.includes(id)
            ? prev.visible
            : [...prev.visible, id]
          : prev.visible.filter((v) => v !== id);

        if (nextVisible.length === 0) {
          nextVisible = [prev.order[0] || columns[0]?.id].filter(
            Boolean
          ) as string[];
        }

        // Preserve user column order
        nextVisible = prev.order.filter((oid) => nextVisible.includes(oid));

        const next = { ...prev, visible: nextVisible };
        persist(tableId, next);
        return next;
      });
    },
    [columns, tableId]
  );

  const reorder = useCallback(
    (activeId: string, overId: string) => {
      if (activeId === overId) return;

      setPrefs((prev) => {
        const order = [...prev.order];
        const from = order.indexOf(activeId);
        const to = order.indexOf(overId);
        if (from === -1 || to === -1) return prev;

        order.splice(from, 1);
        order.splice(to, 0, activeId);

        const visible = order.filter((id) => prev.visible.includes(id));
        const next = { ...prev, order, visible };
        persist(tableId, next);
        return next;
      });
    },
    [tableId]
  );

  const toggleSort = useCallback(
    (id: string) => {
      setPrefs((prev) => {
        let sortId: string | undefined = id;
        let sortDir: "asc" | "desc" = "asc";
        if (prev.sortId === id) {
          if (prev.sortDir === "asc") sortDir = "desc";
          else {
            sortId = undefined;
            sortDir = "asc";
          }
        }
        const next: DataTablePrefs = {
          ...prev,
          sortId,
          sortDir,
        };
        persist(tableId, next);
        return next;
      });
    },
    [tableId]
  );

  const reset = useCallback(() => {
    write({
      visible: defaultsVisible,
      order: defaultsOrder,
      sortId: undefined,
      sortDir: "asc",
    });
  }, [defaultsVisible, defaultsOrder, write]);

  return {
    prefs,
    setVisible,
    reorder,
    toggleSort,
    reset,
    defaultVisible: defaultsVisible,
  };
}
