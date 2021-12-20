import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Either, left, right } from 'fp-ts/Either';

import { DbConnections } from '@marxan-api/ormconfig.connections';
import { Project } from '@marxan-api/modules/projects/project.api.entity';

import {
  planningUnitAreaNotFound,
  PlanningUnitAreaNotFoundError,
} from './change-blm-range.command';

@Injectable()
export class PlanningUnitAreaFetcher {
  constructor(
    @InjectRepository(Project)
    protected readonly projectRepository: Repository<Project>,
    @InjectEntityManager(DbConnections.geoprocessingDB)
    private readonly entityManager: EntityManager,
  ) {}

  async execute(
    id: string,
  ): Promise<Either<PlanningUnitAreaNotFoundError, number>> {
    const project = await this.projectRepository.findOneOrFail(id);

    return await this.getPlanningUnitArea(project);
  }

  private async getPlanningUnitArea(
    project: Project,
  ): Promise<Either<PlanningUnitAreaNotFoundError, number>> {
    const area =
      project.planningUnitAreakm2 ??
      (await this.entityManager
        .query(
          `SELECT AVG(size)/1e6 from "planning_units_geom" WHERE "project_id" = $1`,
          [project.id],
        )
        .then((res) => res[0].avg));

    return Boolean(area) ? right(area) : left(planningUnitAreaNotFound);
  }
}
