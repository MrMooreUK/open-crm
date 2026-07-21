import Link from "next/link";
import { listOpenTasks } from "@/lib/actions/activities";
import { requireMembership } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import { formatDate, fullName } from "@/lib/utils";
import { TaskCompleteButton } from "@/components/tasks/task-complete-button";

export default async function TasksPage() {
  const [{ organization }, tasks] = await Promise.all([
    requireMembership(),
    listOpenTasks(),
  ]);

  const fmt = {
    locale: organization.locale,
    timezone: organization.timezone,
    dateFormat: organization.dateFormat,
  };

  return (
    <div>
      <PageHeader title="Tasks" description={`${tasks.length} open`} />

      {tasks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50/50 px-6 py-16 text-center">
          <h3 className="text-sm font-medium text-zinc-900">No open tasks</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Create tasks from any company, contact, or deal timeline.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs font-medium uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="w-10 px-3 py-2" />
                <th className="px-3 py-2">Task</th>
                <th className="px-3 py-2">Related</th>
                <th className="px-3 py-2">Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {tasks.map((t) => {
                const related = t.deal
                  ? { href: `/deals/${t.deal.id}`, label: t.deal.title }
                  : t.contact
                    ? {
                        href: `/contacts/${t.contact.id}`,
                        label: fullName(
                          t.contact.firstName,
                          t.contact.lastName
                        ),
                      }
                    : t.company
                      ? {
                          href: `/companies/${t.company.id}`,
                          label: t.company.name,
                        }
                      : null;

                return (
                  <tr key={t.id} className="hover:bg-zinc-50/80">
                    <td className="px-3 py-2.5">
                      <TaskCompleteButton id={t.id} />
                    </td>
                    <td className="px-3 py-2.5 text-zinc-900">{t.body}</td>
                    <td className="px-3 py-2.5 text-zinc-600">
                      {related ? (
                        <Link href={related.href} className="hover:underline">
                          {related.label}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-zinc-500">
                      {formatDate(t.dueAt, fmt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
