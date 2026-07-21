import Link from "next/link";
import { getPipelineBoard } from "@/lib/actions/deals";
import { requireMembership } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import { KanbanBoard } from "@/components/pipeline/kanban-board";

export default async function PipelinePage() {
  const [{ organization }, board] = await Promise.all([
    requireMembership(),
    getPipelineBoard(),
  ]);

  if (!board) {
    return (
      <div>
        <PageHeader title="Pipeline" />
        <p className="text-sm text-zinc-500">No pipeline configured.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Pipeline"
        description={board.pipeline.name}
        actions={
          <Link
            href="/deals/new"
            className="inline-flex h-8 items-center rounded-md bg-zinc-900 px-3 text-xs font-medium text-white hover:bg-zinc-800"
          >
            New deal
          </Link>
        }
      />
      <KanbanBoard
        defaultCurrency={organization.currency}
        locale={organization.locale}
        stages={board.stages.map((s) => ({
          id: s.id,
          name: s.name,
          isWon: s.isWon,
          isLost: s.isLost,
          deals: s.deals.map((d) => ({
            id: d.id,
            title: d.title,
            amountCents: d.amountCents,
            currency: d.currency,
            stageId: d.stageId,
            company: d.company
              ? { id: d.company.id, name: d.company.name }
              : null,
          })),
        }))}
      />
    </div>
  );
}
