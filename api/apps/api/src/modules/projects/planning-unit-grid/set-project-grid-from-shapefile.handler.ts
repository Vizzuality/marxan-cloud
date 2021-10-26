import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  PlanningUnitGridShape as ProjectGridShape,
  Project,
} from '@marxan-api/modules/projects/project.api.entity';

import { SetProjectGridFromShapefile } from './set-project-grid-from-shapefile.command';

@CommandHandler(SetProjectGridFromShapefile)
export class SetProjectGridFromShapefileHandler
  implements IInferredCommandHandler<SetProjectGridFromShapefile> {
  constructor(
    @InjectRepository(Project) private readonly projects: Repository<Project>,
  ) {}

  async execute({
    projectId,
    planningAreaId,
    bbox,
  }: SetProjectGridFromShapefile): Promise<void> {
    await this.projects.update(
      {
        id: projectId.value,
      },
      {
        planningUnitGridShape: ProjectGridShape.fromShapefile,
        planningAreaGeometryId: planningAreaId,
        bbox,
      },
    );
  }
}
