import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { isLeft } from 'fp-ts/Either';

import { SetProjectBlm } from './set-project-blm';
import { Logger } from '@nestjs/common';
import { ProjectBlmRepo } from '@marxan-api/modules/blm';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { EntityManager, Repository } from 'typeorm';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { BlmValuesCalculator } from '@marxan-api/modules/projects/blm/domain/blm-values-calculator';

@CommandHandler(SetProjectBlm)
export class SetProjectBlmHandler
  implements IInferredCommandHandler<SetProjectBlm> {
  private readonly logger: Logger = new Logger(SetProjectBlm.name);

  constructor(
    @InjectRepository(Project)
    protected readonly projectRepository: Repository<Project>,
    @InjectEntityManager(DbConnections.geoprocessingDB)
    private readonly entityManager: EntityManager,
    private readonly blmRepository: ProjectBlmRepo,
  ) {}

  async execute({ projectId }: SetProjectBlm): Promise<void> {
    const project = await this.projectRepository.findOneOrFail(projectId);
    const area = await this.getPlanningUnitArea(project);

    if (!area) {
      this.logger.error(
        `Could not get Planning Unit area for project with ID: ${projectId}`,
      );

      return;
    }

    const defaultBlm = BlmValuesCalculator.withDefaultRange(area);

    const result = await this.blmRepository.create(projectId, defaultBlm);
    if (isLeft(result))
      this.logger.error(
        `Project BLM already created for project with ID: ${projectId}`,
      );
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
