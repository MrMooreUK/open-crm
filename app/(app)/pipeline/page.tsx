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
            className="btn-primary btn-primary-sm"
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
            owner: d.owner
              ? {
                  id: d.owner.id,
                  name: d.owner.name,
                  image: d.owner.image ?? null,
                }
              : null,
          })),
        }))}
      />
    </div>
  );
}
