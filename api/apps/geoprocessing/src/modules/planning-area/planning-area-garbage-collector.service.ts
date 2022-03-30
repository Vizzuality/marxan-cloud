import { ProjectsPuEntity } from '@marxan-jobs/planning-unit-geometry';
import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, In } from 'typeorm';
import { GarbageCollectorConfig } from './garbage-collector-config';

@Injectable()
export class PlanningAreaGarbageCollector {
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly config: GarbageCollectorConfig,
  ) {}

  async collectGarbage(
    maxAgeInMs: number = this.config.maxAgeInMs,
    now: Date = new Date(),
  ): Promise<void> {
    await this.entityManager.transaction(async (em) => {
      const unassignedPlanningAreaDate = new Date(now.getTime() - maxAgeInMs);

      const qb = em.createQueryBuilder();
      const result = await qb
        .delete()
        .from('planning_areas')
        .where(`id = project_id`)
        .andWhere('created_at < :unassignedPlanningAreaDate', {
          unassignedPlanningAreaDate,
        })
        .returning('id')
        .execute();

      const deletedPlanningAreasIds = (result.raw as { id: string }[]).map(
        (pa) => pa.id,
      );

      const projectsPuRepo = em.getRepository(ProjectsPuEntity);
      await projectsPuRepo.delete({
        planningAreaId: In(deletedPlanningAreasIds),
      });
    });
  }
}
