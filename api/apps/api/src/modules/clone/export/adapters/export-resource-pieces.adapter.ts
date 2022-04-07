import { ClonePiece, ResourceId, ResourceKind } from '@marxan/cloning/domain';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../../../projects/project.api.entity';
import { ExportResourcePieces } from '../application/export-resource-pieces.port';
import { ExportComponent } from '../domain';

@Injectable()
export class ExportResourcePiecesAdapter implements ExportResourcePieces {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async resolveForProject(
    id: ResourceId,
    scenarioIds: string[],
  ): Promise<ExportComponent[]> {
    const project = await this.projectRepository.findOneOrFail(id.value, {
      relations: ['scenarios'],
    });
    const { scenarios } = project;

    const scenarioPieces: ExportComponent[] = [];

    if (scenarios) {
      scenarioPieces.push(
        ...scenarios
          .filter(
            (scenario) => !scenarioIds || scenarioIds.includes(scenario.id),
          )
          .flatMap((scenario) =>
            this.resolveForScenario(
              new ResourceId(scenario.id),
              ResourceKind.Project,
            ),
          ),
      );
    }

    const customPlanningArea = Boolean(project.planningAreaGeometryId);

    const planningAreaComponents = customPlanningArea
      ? [
          ExportComponent.newOne(id, ClonePiece.PlanningAreaCustom),
          ExportComponent.newOne(id, ClonePiece.PlanningAreaCustomGeojson),
        ]
      : [ExportComponent.newOne(id, ClonePiece.PlanningAreaGAdm)];

    const components: ExportComponent[] = [
      ExportComponent.newOne(id, ClonePiece.ProjectMetadata),
      ExportComponent.newOne(id, ClonePiece.ExportConfig),
      ...planningAreaComponents,
      ExportComponent.newOne(id, ClonePiece.PlanningUnitsGrid),
      ExportComponent.newOne(id, ClonePiece.PlanningUnitsGridGeojson),
      ExportComponent.newOne(id, ClonePiece.ProjectCustomProtectedAreas),
      ExportComponent.newOne(id, ClonePiece.ProjectCustomFeatures),
      ...scenarioPieces,
    ];

    return components;
  }

  resolveForScenario(id: ResourceId, kind: ResourceKind): ExportComponent[] {
    const pieces: ExportComponent[] = [
      ExportComponent.newOne(id, ClonePiece.ScenarioMetadata),
      ExportComponent.newOne(id, ClonePiece.ScenarioProtectedAreas),
      ExportComponent.newOne(id, ClonePiece.ScenarioPlanningUnitsData),
      ExportComponent.newOne(id, ClonePiece.ScenarioRunResults),
      ExportComponent.newOne(id, ClonePiece.ScenarioFeaturesData),
      ExportComponent.newOne(id, ClonePiece.ScenarioInputFolder),
      ExportComponent.newOne(id, ClonePiece.ScenarioOutputFolder),
    ];

    if (kind === ResourceKind.Scenario) {
      pieces.push(ExportComponent.newOne(id, ClonePiece.ExportConfig));
    }

    return pieces;
  }
}
