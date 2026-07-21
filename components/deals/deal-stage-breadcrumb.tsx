import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type StageCrumb = {
  id: string;
  name: string;
  isWon?: boolean;
  isLost?: boolean;
};

/**
 * Pipeline stage trail for a deal — shows where the deal sits in the board.
 */
export function DealStageBreadcrumb({
  stages,
  currentStageId,
  pipelineName = "Pipeline",
}: {
  stages: StageCrumb[];
  currentStageId: string;
  pipelineName?: string;
}) {
  const currentIndex = stages.findIndex((s) => s.id === currentStageId);
  const current = currentIndex >= 0 ? stages[currentIndex] : null;

  return (
    <nav
      aria-label="Deal stage"
      className="mb-5 overflow-x-auto rounded-lg border border-zinc-200/90 bg-gradient-to-r from-brand-subtle/50 via-white to-white px-3 py-2.5 shadow-sm shadow-zinc-900/[0.02]"
    >
      <ol className="flex min-w-min items-center gap-0.5 text-sm">
        <li className="flex shrink-0 items-center">
          <Link
            href="/pipeline"
            className="rounded px-1.5 py-0.5 text-xs font-medium text-brand hover:bg-brand-subtle hover:underline"
          >
            {pipelineName}
          </Link>
          <ChevronRight
            className="mx-0.5 h-3.5 w-3.5 shrink-0 text-zinc-300"
            aria-hidden
          />
        </li>

        {stages.map((stage, index) => {
          const isCurrent = stage.id === currentStageId;
          const isPast = currentIndex >= 0 && index < currentIndex;
          const isFuture = currentIndex >= 0 && index > currentIndex;
          const isLast = index === stages.length - 1;

          return (
            <li key={stage.id} className="flex shrink-0 items-center">
              <span
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
                  isCurrent &&
                    stage.isWon &&
                    "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200",
                  isCurrent &&
                    stage.isLost &&
                    "bg-red-50 text-red-800 ring-1 ring-red-200",
                  isCurrent &&
                    !stage.isWon &&
                    !stage.isLost &&
                    "bg-brand text-brand-foreground shadow-sm shadow-teal-900/10",
                  isPast && "text-brand-active",
                  isFuture && "text-zinc-400"
                )}
              >
                {isPast ? (
                  <Check
                    className="h-3 w-3 shrink-0 text-brand"
                    aria-hidden
                  />
                ) : null}
                {stage.name}
              </span>
              {!isLast ? (
                <ChevronRight
                  className={cn(
                    "mx-0.5 h-3.5 w-3.5 shrink-0",
                    isPast || isCurrent ? "text-brand-border" : "text-zinc-300"
                  )}
                  aria-hidden
                />
              ) : null}
            </li>
          );
        })}
      </ol>

      {current ? (
        <p className="mt-1.5 text-[11px] text-zinc-500 sm:hidden">
          Current stage:{" "}
          <span className="font-medium text-zinc-800">{current.name}</span>
        </p>
      ) : null}
    </nav>
  );
}
