import { Command, Console } from 'nestjs-console';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { BlockGuard } from '@marxan-api/modules/projects/block-guard/block-guard.service';
import { DeleteProject } from '@marxan-api/modules/projects/delete-project/delete-project.command';
import { readEmailList } from './email-list';
import { writeCsv } from './manifests';
import { classifyProjects, choosePromotionTarget, ProjectRole } from './deletion-planner';
import { DeletionDataAccess } from './deletion-data-access';

interface RunOptions {
  emails: string;
  out: string;
  exclude?: string;
  apply?: boolean;
  deleteAlreadyOrphaned?: boolean;
  env?: string;
}

/**
 * MRXNM-72 — hard-delete a supplied list of users and the projects they orphan.
 *
 * Reuses the `DeleteProject` CQRS command (so the `ProjectDeleted` saga enqueues
 * the async Geo-DB cleanup — raw SQL would orphan the geo tables). Keeps projects
 * still shared with a survivor, promoting a new owner where the only survivors are
 * non-owners. Hard-delete residual references (`created_by`, export/import
 * `owner_id`) are cleared, then user rows are deleted — all in one API-DB
 * transaction so an unexpected FK rolls everything back.
 *
 * Dry-run by default (writes CSV manifests only); pass --apply to mutate.
 */
@Injectable()
@Console()
export class BulkUserDeletionCommand {
  private readonly logger = new Logger(BulkUserDeletionCommand.name);

  constructor(
    @InjectDataSource(DbConnections.default) private readonly api: DataSource,
    private readonly commandBus: CommandBus,
    @Inject(BlockGuard) private readonly blockGuard: BlockGuard,
  ) {}

  @Command({
    command: 'bulk-user-deletion',
    description:
      'MRXNM-72: hard-delete listed users + orphaned projects (dry-run unless --apply)',
    options: [
      { flags: '--emails <path>', required: true },
      { flags: '--out <dir>', required: true },
      { flags: '--exclude <path>', required: false },
      { flags: '--delete-already-orphaned', required: false },
      { flags: '--apply', required: false },
      { flags: '--env <env>', required: false },
    ],
  })
  async run(options: RunOptions): Promise<void> {
    const apply = !!options.apply;
    const dao = new DeletionDataAccess(this.api);

    // ---- Phase 0: plan ----
    // Read the full list, then subtract an explicit exclusion list (e.g. internal
    // or automation accounts that must never be deleted). Excluded-but-present
    // entries are reported so the carve-out is auditable.
    const listed = readEmailList(options.emails);
    const excluded = options.exclude
      ? new Set(readEmailList(options.exclude))
      : new Set<string>();
    const emails = listed.filter((e) => !excluded.has(e));
    const excludedFromList = listed.filter((e) => excluded.has(e));

    const users = await dao.resolveUserIds(emails);
    const deletees = new Set(users.map((u) => u.id));
    const matchedEmails = new Set(users.map((u) => u.email.toLowerCase()));
    const unmatched = emails.filter((e) => !matchedEmails.has(e));

    const memberships = await dao.loadProjectMemberships();
    const buckets = classifyProjects(memberships, deletees);
    const promotions: Array<{
      projectId: string;
      target: { userId: string; fromRole: ProjectRole };
    }> = [];
    for (const p of buckets.kept) {
      const target = choosePromotionTarget(p, deletees);
      if (target) promotions.push({ projectId: p.projectId, target });
    }

    // ---- manifests (always) ----
    writeCsv(`${options.out}/users_to_delete.csv`, ['user_id', 'email'], users.map((u) => [u.id, u.email]));
    writeCsv(`${options.out}/projects_already_orphaned_bucketA.csv`, ['project_id'], buckets.alreadyOrphaned.map((p) => [p.projectId]));
    writeCsv(`${options.out}/projects_delete_bucketB.csv`, ['project_id'], buckets.becomesOrphaned.map((p) => [p.projectId]));
    writeCsv(
      `${options.out}/projects_keep_bucketC.csv`,
      ['project_id', 'promote_user_id'],
      buckets.kept.map((p) => [
        p.projectId,
        promotions.find((x) => x.projectId === p.projectId)?.target.userId ?? '',
      ]),
    );
    if (unmatched.length) {
      writeCsv(`${options.out}/unmatched_emails.csv`, ['email'], unmatched.map((e) => [e]));
    }
    if (excludedFromList.length) {
      writeCsv(`${options.out}/excluded_emails.csv`, ['email'], excludedFromList.map((e) => [e]));
    }

    // Projects to delete: bucket B always; bucket A (pre-existing orphans, already
    // inaccessible to everyone) only when --delete-already-orphaned is set.
    const alsoDeleteOrphans = !!options.deleteAlreadyOrphaned;
    const projectsToDelete = [
      ...buckets.becomesOrphaned,
      ...(alsoDeleteOrphans ? buckets.alreadyOrphaned : []),
    ];

    this.logger.log(
      `[plan] listed=${listed.length} excluded=${excludedFromList.length} ` +
        `users=${users.length} unmatched=${unmatched.length} ` +
        `A=${buckets.alreadyOrphaned.length} B=${buckets.becomesOrphaned.length} ` +
        `C=${buckets.kept.length} promotions=${promotions.length} ` +
        `delete-already-orphaned=${alsoDeleteOrphans} -> projectsToDelete=${projectsToDelete.length}`,
    );

    if (!apply) {
      this.logger.log('[plan] DRY-RUN — manifests written, no mutations. Re-run with --apply to execute.');
      return;
    }

    // ---- Phase 1: delete target projects via the proper async path ----
    const blocked: string[] = [];
    let deleted = 0;
    for (const p of projectsToDelete) {
      try {
        await this.blockGuard.ensureThatProjectIsNotBlocked(p.projectId);
      } catch {
        blocked.push(p.projectId); // skip + report (pending job)
        continue;
      }
      await this.commandBus.execute(new DeleteProject(p.projectId)); // saga enqueues geo cleanup
      deleted++;
      if (deleted % 50 === 0) {
        this.logger.log(`[delete] ${deleted}/${projectsToDelete.length}`);
      }
    }
    writeCsv(`${options.out}/blockguard_hits.csv`, ['project_id'], blocked.map((id) => [id]));
    this.logger.log(
      `[delete] done: ${deleted} deleted, ${blocked.length} skipped (blocked). ` +
        `${deleted} async Geo-DB cleanup jobs enqueued — MONITOR the ` +
        `'unused-resources-cleanup-queue-name' queue and let it drain before the Geo-DB VACUUM.`,
    );

    // ---- Phases 3-5: promote owners, clear residuals, hard-delete users (one txn) ----
    const deleteeIds = [...deletees];
    await this.api.transaction(async (m) => {
      // Phase 3: promote a surviving member to owner on owner-less kept projects
      for (const { projectId, target } of promotions) {
        await m.query(
          `INSERT INTO users_projects (user_id, project_id, role_id)
           VALUES ($1, $2, 'project_owner')
           ON CONFLICT (user_id, project_id, role_id) DO NOTHING`,
          [target.userId, projectId],
        );
      }
      // Phase 4a: null dangling creator refs (safe — created_by is never read back)
      await m.query(`UPDATE projects  SET created_by = NULL WHERE created_by = ANY($1::uuid[])`, [deleteeIds]);
      await m.query(`UPDATE scenarios SET created_by = NULL WHERE created_by = ANY($1::uuid[])`, [deleteeIds]);
      // Phase 4b: exports/imports owner_id is NOT NULL -> reassign to a surviving
      // owner (read within the txn so promotions above are visible), else delete.
      const residual = await dao.loadResidualOwnerRows(deleteeIds, m);
      for (const r of residual.reassign) {
        await m.query(`UPDATE ${r.table} SET owner_id = $1 WHERE id = $2`, [r.newOwnerId, r.id]);
      }
      for (const r of residual.delete) {
        await m.query(`DELETE FROM ${r.table} WHERE id = $1`, [r.id]);
      }
      // Phase 5: hard-delete users (FKs cascade users_projects/_organizations/_scenarios/tokens/locks/...)
      await m.query(`DELETE FROM users WHERE id = ANY($1::uuid[])`, [deleteeIds]);
      this.logger.log(
        `[users] hard-deleted ${deleteeIds.length} users ` +
          `(reassigned ${residual.reassign.length}, deleted ${residual.delete.length} export/import rows)`,
      );
    });

    // ---- Phase 6: verify + reclaim ----
    const [{ remaining }] = await this.api.query(
      `SELECT count(*)::int AS remaining FROM users WHERE id = ANY($1::uuid[])`,
      [deleteeIds],
    );
    const deletedTargets = projectsToDelete
      .filter((p) => !blocked.includes(p.projectId))
      .map((p) => p.projectId);
    const [{ bremaining }] = await this.api.query(
      `SELECT count(*)::int AS bremaining FROM projects WHERE id = ANY($1::uuid[])`,
      [deletedTargets],
    );
    this.logger.log(
      `[verify] users remaining: ${remaining} (expect 0); target projects remaining: ${bremaining} (expect 0)`,
    );
    if (remaining !== 0 || bremaining !== 0) {
      throw new Error('[verify] post-conditions not met — investigate before VACUUM');
    }
    await this.api.query(`VACUUM (ANALYZE) users, projects, scenarios, exports, imports, users_projects`);
    this.logger.log(
      '[done] complete. Once the cleanup queue is fully drained, run VACUUM (FULL) + reindex on the Geo DB separately (it locks).',
    );
  }
}
