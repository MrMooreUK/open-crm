"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type AccordionItem = {
  id: string;
  title: string;
  description?: string;
  content: React.ReactNode;
};

export function Accordion({
  items,
  defaultOpenId,
  /** Allow multiple panels open at once */
  multi = false,
  className,
}: {
  items: AccordionItem[];
  defaultOpenId?: string;
  multi?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState<Set<string>>(() => {
    const id =
      defaultOpenId && items.some((i) => i.id === defaultOpenId)
        ? defaultOpenId
        : items[0]?.id;
    return id ? new Set([id]) : new Set();
  });

  function toggle(id: string) {
    setOpen((prev) => {
      if (multi) {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      }
      if (prev.has(id)) return new Set();
      return new Set([id]);
    });
  }

  return (
    <div
      className={cn(
        "divide-y divide-zinc-200 overflow-hidden rounded-lg border border-zinc-200 bg-white",
        className
      )}
    >
      {items.map((item) => {
        const isOpen = open.has(item.id);
        return (
          <div key={item.id} id={`doc-${item.id}`}>
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`doc-panel-${item.id}`}
              onClick={() => toggle(item.id)}
              className={cn(
                "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-zinc-50",
                isOpen && "bg-zinc-50/80"
              )}
            >
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-zinc-900">
                  {item.title}
                </span>
                {item.description ? (
                  <span className="mt-0.5 block text-xs text-zinc-500">
                    {item.description}
                  </span>
                ) : null}
              </span>
              <ChevronDown
                className={cn(
                  "mt-0.5 h-4 w-4 shrink-0 text-zinc-400 transition-transform",
                  isOpen && "rotate-180 text-brand"
                )}
              />
            </button>
            <div
              id={`doc-panel-${item.id}`}
              role="region"
              hidden={!isOpen}
              className={cn(!isOpen && "hidden")}
            >
              <div className="border-t border-zinc-100 px-4 py-4 text-sm text-zinc-600">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
