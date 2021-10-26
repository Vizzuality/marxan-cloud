import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  PlanningUnitGridShape as ProjectGridShape,
  Project,
} from '@marxan-api/modules/projects/project.api.entity';

import { SetProjectGridFromShapefile } from './set-project-grid-from-shapefile.command';
import { PlanningUnitGridShape } from '@marxan/scenarios-planning-unit';

// TODO Debt - move grid shape to totally standalone lib
// may be not so easy, as Project's enum is used as a type within database
// some "transform" could be used tho
const mapping: Record<PlanningUnitGridShape, ProjectGridShape> = {
  [PlanningUnitGridShape.fromShapefile]: ProjectGridShape.fromShapefile,
  [PlanningUnitGridShape.hexagon]: ProjectGridShape.hexagon,
  [PlanningUnitGridShape.square]: ProjectGridShape.square,
};

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
        planningUnitGridShape: mapping[PlanningUnitGridShape.fromShapefile],
        planningAreaGeometryId: planningAreaId,
        bbox,
      },
    );
  }
}
