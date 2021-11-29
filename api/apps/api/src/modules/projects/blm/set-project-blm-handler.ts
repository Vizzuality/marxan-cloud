import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { isLeft } from 'fp-ts/Either';

import { SetProjectBlm } from './set-project-blm';
import { Logger } from '@nestjs/common';
import { ProjectBlmRepo, unknownError } from '@marxan-api/modules/blm';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { EntityManager, Repository } from 'typeorm';
import { DbConnections } from '@marxan-api/ormconfig.connections';

export const queryFailure = Symbol(
  `could not query planning unit area for project`,
);
export type QueryPlanningUnitAreaFailure =
  | typeof unknownError
  | typeof queryFailure;

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

    const cardinality = 6;
    const [min, max] = [0.001, 100];
    const initialArray = Array(cardinality - 1)
      .fill(0)
      .map((_, i) => i + 1);

    const formulaResults = initialArray.map(
      (i) => min + ((max - min) / cardinality - 1) * i,
    );
    const blmValues = [min, ...formulaResults];
    const defaultBlm = blmValues.map((value) => value * Math.sqrt(area));

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
