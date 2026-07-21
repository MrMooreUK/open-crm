import { createId } from "@/lib/id";
import { db } from "@/lib/db";
import { members, organizations, pipelines, stages } from "@/lib/db/schema";
import { slugify } from "@/lib/utils";

const DEFAULT_STAGES = [
  { name: "Lead", position: 0, isWon: false, isLost: false },
  { name: "Qualified", position: 1, isWon: false, isLost: false },
  { name: "Proposal", position: 2, isWon: false, isLost: false },
  { name: "Negotiation", position: 3, isWon: false, isLost: false },
  { name: "Won", position: 4, isWon: true, isLost: false },
  { name: "Lost", position: 5, isWon: false, isLost: true },
];

export async function createOrganizationForUser(params: {
  userId: string;
  organizationName: string;
}) {
  const baseSlug = slugify(params.organizationName) || "workspace";
  const slug = `${baseSlug}-${createId().slice(0, 6).toLowerCase()}`;
  const orgId = createId("org");
  const pipelineId = createId("pipe");

  await db.insert(organizations).values({
    id: orgId,
    name: params.organizationName.trim(),
    slug,
  });

  await db.insert(members).values({
    id: createId("mem"),
    organizationId: orgId,
    userId: params.userId,
    role: "owner",
  });

  await db.insert(pipelines).values({
    id: pipelineId,
    organizationId: orgId,
    name: "Sales",
    isDefault: true,
  });

  await db.insert(stages).values(
    DEFAULT_STAGES.map((s) => ({
      id: createId("stg"),
      pipelineId,
      name: s.name,
      position: s.position,
      isWon: s.isWon,
      isLost: s.isLost,
    }))
  );

  return { organizationId: orgId, slug };
}
