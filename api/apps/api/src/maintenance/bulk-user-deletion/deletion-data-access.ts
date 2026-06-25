import { DataSource } from 'typeorm';
import { ProjectMembership, ProjectRole } from './deletion-planner';

/** Anything that can run a parameterized query: a DataSource or a transaction EntityManager. */
export interface QueryExecutor {
  query(sql: string, params?: unknown[]): Promise<any>;
}

export type ResidualTable = 'exports' | 'imports';

export interface ResidualPlan {
  /** rows whose referenced project still exists → reassign owner to a survivor */
  reassign: Array<{ table: ResidualTable; id: string; newOwnerId: string }>;
  /** rows whose referenced resource is gone → delete (stale orphans) */
  delete: Array<{ table: ResidualTable; id: string }>;
}

/**
 * Thin SQL layer over the API DB for the bulk-deletion command. Verified by the
 * staging rehearsal (not unit-tested); the decision logic it feeds is covered by
 * deletion-planner.spec.ts. Queries here are the ones validated read-only against
 * production on 2026-06-23.
 */
export class DeletionDataAccess {
  constructor(private readonly api: DataSource) {}

  /** Resolve the email list to existing user ids (case-insensitive match). */
  async resolveUserIds(emails: string[]): Promise<{ id: string; email: string }[]> {
    return this.api.query(
      `SELECT u.id, u.email FROM users u WHERE lower(u.email) = ANY($1::text[])`,
      [emails],
    );
  }

  /** Every project with its members (user_id + role) and creator. */
  async loadProjectMemberships(): Promise<ProjectMembership[]> {
    const rows: Array<{
      project_id: string;
      created_by: string | null;
      user_id: string | null;
      role_id: ProjectRole | null;
    }> = await this.api.query(`
      SELECT p.id AS project_id, p.created_by, up.user_id, up.role_id
      FROM projects p
      LEFT JOIN users_projects up ON up.project_id = p.id`);
    const byId = new Map<string, ProjectMembership>();
    for (const r of rows) {
      let pm = byId.get(r.project_id);
      if (!pm) {
        pm = { projectId: r.project_id, createdBy: r.created_by, members: [] };
        byId.set(r.project_id, pm);
      }
      if (r.user_id && r.role_id) {
        pm.members.push({ userId: r.user_id, role: r.role_id });
      }
    }
    return [...byId.values()];
  }

  /**
   * Classify export/import rows owned by a deletee into reassign-vs-delete.
   * MUST run AFTER bucket-B projects are deleted and owners promoted, so that the
   * reassign target (`new_owner_id`) is a guaranteed-present project_owner of the
   * still-existing referenced project. `exports.resource_id` may be a project or a
   * scenario; `imports` use project_id (falling back to resource_id).
   */
  async loadResidualOwnerRows(
    deletees: string[],
    exec: QueryExecutor = this.api,
  ): Promise<ResidualPlan> {
    // Candidate new owner must be a SURVIVING (non-deletee) project_owner —
    // otherwise we'd "reassign" to another deletee (no-op) and the later
    // `DELETE FROM users` would still hit the NOT-NULL owner_id FK. When no
    // surviving owner exists (e.g. an export/import of a blocked bucket-B
    // project whose every owner is a deletee, or a resource already deleted in
    // Phase 1), new_owner_id is null → the row is deleted instead. Correlated
    // subqueries with MIN give exactly one deterministic row per export/import.
    const exportRows: Array<{ id: string; new_owner_id: string | null }> =
      await exec.query(
        `SELECT e.id,
           COALESCE(
             (SELECT po.user_id FROM users_projects po
               WHERE po.project_id = e.resource_id AND po.role_id = 'project_owner'
                 AND NOT (po.user_id = ANY($1::uuid[]))
               ORDER BY po.user_id LIMIT 1),
             (SELECT so.user_id FROM users_projects so
               JOIN scenarios s ON s.project_id = so.project_id
               WHERE s.id = e.resource_id AND so.role_id = 'project_owner'
                 AND NOT (so.user_id = ANY($1::uuid[]))
               ORDER BY so.user_id LIMIT 1)
           ) AS new_owner_id
         FROM exports e
         WHERE e.owner_id = ANY($1::uuid[])`,
        [deletees],
      );
    const importRows: Array<{ id: string; new_owner_id: string | null }> =
      await exec.query(
        `SELECT i.id,
           (SELECT po.user_id FROM users_projects po
             WHERE po.project_id = COALESCE(i.project_id, i.resource_id)
               AND po.role_id = 'project_owner'
               AND NOT (po.user_id = ANY($1::uuid[]))
             ORDER BY po.user_id LIMIT 1) AS new_owner_id
         FROM imports i
         WHERE i.owner_id = ANY($1::uuid[])`,
        [deletees],
      );
    const out: ResidualPlan = { reassign: [], delete: [] };
    const sort = (rows: Array<{ id: string; new_owner_id: string | null }>, table: ResidualTable) => {
      for (const r of rows) {
        if (r.new_owner_id) {
          out.reassign.push({ table, id: r.id, newOwnerId: r.new_owner_id });
        } else {
          out.delete.push({ table, id: r.id });
        }
      }
    };
    sort(exportRows, 'exports');
    sort(importRows, 'imports');
    return out;
  }
}
