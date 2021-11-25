import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { Either, isLeft, isRight, left } from 'fp-ts/Either';

import {
  ChangeBlmRange,
  ChangeRangeErrors,
  invalidRange,
  queryFailure,
  updateFailure,
} from './change-blm-range.command';
import { ProjectBlm, ProjectBlmRepo } from '@marxan-api/modules/blm';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { EntityManager, Repository } from 'typeorm';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { Logger } from '@nestjs/common';
import { SetProjectBlm } from '@marxan-api/modules/projects/blm/set-project-blm';
import { BlmValuesCalculator } from '@marxan-api/modules/projects/blm/domain/blm-values-calculator';

@CommandHandler(ChangeBlmRange)
export class ChangeBlmRangeHandler
  implements IInferredCommandHandler<ChangeBlmRange> {
  private readonly logger: Logger = new Logger(SetProjectBlm.name);

  constructor(
    @InjectRepository(Project)
    protected readonly projectRepository: Repository<Project>,
    @InjectEntityManager(DbConnections.geoprocessingDB)
    private readonly entityManager: EntityManager,
    private readonly blmRepository: ProjectBlmRepo,
  ) {}

  async execute({
    projectId,
    range,
  }: ChangeBlmRange): Promise<Either<ChangeRangeErrors, ProjectBlm>> {
    if (this.isInValidRange(range)) {
      this.logger.error(
        `Received range [${range[0]},${range[1]}] for project with ID: ${projectId} is invalid`,
      );

      return left(invalidRange);
    }

    const project = await this.projectRepository.findOneOrFail(projectId);
    const area = await this.getPlanningUnitArea(project);

    if (!area) {
      this.logger.error(
        `Could not get Planning Unit area for project with ID: ${projectId}`,
      );

      return left(queryFailure);
    }

    const blmValues = BlmValuesCalculator.with(range, area);

    const result = await this.blmRepository.update(projectId, range, blmValues);
    if (isLeft(result)) {
      this.logger.error(
        `Could not update BLM for project with ID: ${projectId}`,
      );

      return left(updateFailure);
    }

    const updatedBlmValues = await this.blmRepository.get(projectId);
    if (isRight(updatedBlmValues)) return updatedBlmValues;

    return left(queryFailure);
  }

  private isInValidRange(range: [number, number]) {
    return range.length !== 2 && range[0] < 0 && range[0] > range[1];
  }

  private async getPlanningUnitArea(
    project: Project,
  ): Promise<number | undefined> {
    return (
      project?.planningUnitAreakm2 ??
      (await this.entityManager
        .query(
          `SELECT AVG(size) from "planning_units_geom" WHERE "project_id" = $1`,
          [project.id],
        )
        .then((res) => res[0].avg))
    );
  }
}
