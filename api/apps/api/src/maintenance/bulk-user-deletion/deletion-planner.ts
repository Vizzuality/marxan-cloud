export type ProjectRole =
  | 'project_owner'
  | 'project_contributor'
  | 'project_viewer';

export interface ProjectMembership {
  projectId: string;
  createdBy: string | null;
  members: Array<{ userId: string; role: ProjectRole }>;
}

export interface ProjectBuckets {
  /** A — already orphaned (no members today). Reported only, never deleted. */
  alreadyOrphaned: ProjectMembership[];
  /** B — becomes orphaned (every member is a deletee). Deleted. */
  becomesOrphaned: ProjectMembership[];
  /** C — still shared with at least one surviving user. Kept. */
  kept: ProjectMembership[];
}

/**
 * Bucket every project given the set of users being deleted. "Shared with a
 * surviving user" wins regardless of role: a single surviving viewer keeps the
 * project.
 */
export function classifyProjects(
  projects: ProjectMembership[],
  deletees: Set<string>,
): ProjectBuckets {
  const buckets: ProjectBuckets = {
    alreadyOrphaned: [],
    becomesOrphaned: [],
    kept: [],
  };
  for (const p of projects) {
    if (p.members.length === 0) {
      buckets.alreadyOrphaned.push(p);
    } else if (p.members.some((m) => !deletees.has(m.userId))) {
      buckets.kept.push(p);
    } else {
      buckets.becomesOrphaned.push(p);
    }
  }
  return buckets;
}

const PROMOTION_RANK: Record<ProjectRole, number> = {
  project_owner: 0,
  project_contributor: 1,
  project_viewer: 2,
};

/**
 * For a kept project, return the surviving member to promote to `project_owner`,
 * or null if a surviving owner already exists (no promotion needed). Prefers a
 * contributor over a viewer; ties broken deterministically by userId.
 */
export function choosePromotionTarget(
  p: ProjectMembership,
  deletees: Set<string>,
): { userId: string; fromRole: ProjectRole } | null {
  const survivors = p.members.filter((m) => !deletees.has(m.userId));
  if (survivors.length === 0) return null; // not a kept project
  if (survivors.some((m) => m.role === 'project_owner')) return null; // already owned
  const best = [...survivors].sort(
    (a, b) =>
      PROMOTION_RANK[a.role] - PROMOTION_RANK[b.role] ||
      a.userId.localeCompare(b.userId),
  )[0];
  return { userId: best.userId, fromRole: best.role };
}
