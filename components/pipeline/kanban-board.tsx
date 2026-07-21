"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { moveDeal } from "@/lib/actions/deals";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

type DealCard = {
  id: string;
  title: string;
  amountCents: number;
  currency: string;
  stageId: string;
  company: { id: string; name: string } | null;
};

type StageCol = {
  id: string;
  name: string;
  isWon: boolean;
  isLost: boolean;
  deals: DealCard[];
};

function DealItem({
  deal,
  isDragging,
}: {
  deal: DealCard;
  isDragging?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: deal.id,
    data: { deal },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "cursor-grab rounded-md border border-zinc-200 bg-white p-2.5 shadow-sm active:cursor-grabbing",
        isDragging && "opacity-40"
      )}
    >
      <Link
        href={`/deals/${deal.id}`}
        onClick={(e) => e.stopPropagation()}
        className="text-sm font-medium text-zinc-900 hover:underline"
      >
        {deal.title}
      </Link>
      <div className="mt-1 text-xs text-zinc-500">
        {deal.company?.name ?? "No company"}
      </div>
      <div className="mt-1 text-xs font-medium text-zinc-700">
        {formatCurrency(deal.amountCents, deal.currency)}
      </div>
    </div>
  );
}

function StageColumn({
  stage,
  children,
}: {
  stage: StageCol;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  const total = stage.deals.reduce((sum, d) => sum + d.amountCents, 0);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-64 shrink-0 flex-col rounded-lg border border-zinc-200 bg-zinc-50/80",
        isOver && "ring-2 ring-zinc-300"
      )}
    >
      <div className="border-b border-zinc-200 px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
            {stage.name}
          </h3>
          <span className="text-[11px] text-zinc-400">{stage.deals.length}</span>
        </div>
        <div className="mt-0.5 text-[11px] text-zinc-500">
          {formatCurrency(total)}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2">
        {children}
      </div>
    </div>
  );
}

export function KanbanBoard({ stages: initialStages }: { stages: StageCol[] }) {
  const router = useRouter();
  const [stages, setStages] = useState(initialStages);
  const [activeDeal, setActiveDeal] = useState<DealCard | null>(null);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  function findDeal(dealId: string) {
    for (const stage of stages) {
      const deal = stage.deals.find((d) => d.id === dealId);
      if (deal) return { deal, stageId: stage.id };
    }
    return null;
  }

  function onDragStart(event: DragStartEvent) {
    const found = findDeal(String(event.active.id));
    setActiveDeal(found?.deal ?? null);
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveDeal(null);
    const { active, over } = event;
    if (!over) return;

    const dealId = String(active.id);
    let targetStageId = String(over.id);

    // If dropped on a deal, resolve its stage
    const overDeal = findDeal(targetStageId);
    if (overDeal) {
      targetStageId = overDeal.stageId;
    }

    const source = findDeal(dealId);
    if (!source || source.stageId === targetStageId) return;

    // Optimistic update
    setStages((prev) => {
      const next = prev.map((s) => ({
        ...s,
        deals: s.deals.filter((d) => d.id !== dealId),
      }));
      return next.map((s) =>
        s.id === targetStageId
          ? {
              ...s,
              deals: [
                { ...source.deal, stageId: targetStageId },
                ...s.deals,
              ],
            }
          : s
      );
    });

    startTransition(async () => {
      await moveDeal(dealId, targetStageId);
      router.refresh();
    });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <StageColumn key={stage.id} stage={stage}>
            {stage.deals.map((deal) => (
              <DealItem
                key={deal.id}
                deal={deal}
                isDragging={activeDeal?.id === deal.id}
              />
            ))}
          </StageColumn>
        ))}
      </div>
      <DragOverlay>
        {activeDeal ? (
          <div className="w-60 rounded-md border border-zinc-300 bg-white p-2.5 shadow-lg">
            <div className="text-sm font-medium">{activeDeal.title}</div>
            <div className="mt-1 text-xs text-zinc-500">
              {formatCurrency(activeDeal.amountCents, activeDeal.currency)}
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
