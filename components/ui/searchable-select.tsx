"use client";

import { useMemo, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type SearchableOption = {
  id: string;
  label: string;
  /** Extra searchable text (email, domain, etc.) */
  meta?: string;
  /** Optional secondary line in dropdown */
  sublabel?: string;
};

/**
 * Type-to-search select. Controlled by value/onChange.
 * Pass empty id for "none" when allowEmpty is true.
 */
export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Search…",
  emptyLabel = "None",
  allowEmpty = true,
  disabled,
  name,
  className,
}: {
  options: SearchableOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  emptyLabel?: string;
  allowEmpty?: boolean;
  disabled?: boolean;
  /** Optional hidden input for native form posts */
  name?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.id === value);
  const closedLabel = selected?.label ?? (value ? value : allowEmpty ? "" : "");
  const inputValue = open ? (query ?? "") : closedLabel;

  const filtered = useMemo(() => {
    const q = (query ?? "").trim().toLowerCase();
    if (!q) return options.slice(0, 12);
    return options
      .filter(
        (o) =>
          o.label.toLowerCase().includes(q) ||
          (o.meta && o.meta.toLowerCase().includes(q)) ||
          (o.sublabel && o.sublabel.toLowerCase().includes(q))
      )
      .slice(0, 12);
  }, [options, query]);

  function pick(id: string) {
    onChange(id);
    setQuery(null);
    setOpen(false);
  }

  function clear() {
    onChange("");
    setQuery("");
    setOpen(true);
    inputRef.current?.focus();
  }

  return (
    <div
      ref={rootRef}
      className={cn("relative", className)}
      onBlur={(e) => {
        if (!rootRef.current?.contains(e.relatedTarget as Node)) {
          setOpen(false);
          setQuery(null);
        }
      }}
    >
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <div
        className={cn(
          "flex h-9 items-center gap-2 rounded-md border border-zinc-200 bg-white px-2.5 shadow-sm transition-colors",
          open && "ring-2 ring-zinc-400",
          disabled && "opacity-50"
        )}
      >
        <Search className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400"
          onFocus={() => {
            setOpen(true);
            setQuery("");
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (filtered[0]) pick(filtered[0].id);
              else if (allowEmpty && !(query ?? "").trim()) pick("");
            }
            if (e.key === "Escape") {
              setOpen(false);
              setQuery(null);
            }
          }}
        />
        {value && !disabled ? (
          <button
            type="button"
            onClick={clear}
            className="rounded p-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
            aria-label="Clear"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
        )}
      </div>

      {open && !disabled ? (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-zinc-200 bg-white py-1 shadow-lg">
          {allowEmpty ? (
            <button
              type="button"
              className={cn(
                "flex w-full px-3 py-2 text-left text-sm hover:bg-zinc-50",
                !value && "bg-zinc-50 font-medium"
              )}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick("")}
            >
              <span className="text-zinc-500">{emptyLabel}</span>
            </button>
          ) : null}

          {filtered.length === 0 ? (
            <p className="px-3 py-2 text-xs text-zinc-500">No matches</p>
          ) : (
            filtered.map((o) => (
              <button
                key={o.id}
                type="button"
                className={cn(
                  "flex w-full flex-col px-3 py-2 text-left hover:bg-zinc-50",
                  o.id === value && "bg-zinc-50"
                )}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(o.id)}
              >
                <span className="text-sm font-medium text-zinc-900">
                  {o.label}
                </span>
                {o.sublabel ? (
                  <span className="text-xs text-zinc-500">{o.sublabel}</span>
                ) : null}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
