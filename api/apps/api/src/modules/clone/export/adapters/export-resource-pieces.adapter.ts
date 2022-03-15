import { ClonePiece, ResourceId, ResourceKind } from '@marxan/cloning/domain';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../../../projects/project.api.entity';
import { ExportResourcePieces } from '../application/export-resource-pieces.port';
import { ExportComponent } from '../domain';

@Injectable()
export class ExportResourcePiecesAdapter implements ExportResourcePieces {
  private resolverMapping: Record<
    ResourceKind,
    (id: ResourceId, kind: ResourceKind) => Promise<ExportComponent[]>
  > = {
    project: this.resolveForProject.bind(this),
    scenario: this.resolveForScenario.bind(this),
  };

  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  resolveFor(id: ResourceId, kind: ResourceKind): Promise<ExportComponent[]> {
    return this.resolverMapping[kind](id, kind);
  }

  private async resolveForProject(
    id: ResourceId,
    kind: ResourceKind,
  ): Promise<ExportComponent[]> {
    const project = await this.projectRepository.findOneOrFail(id.value, {
      relations: ['scenarios'],
    });
    const { scenarios } = project;

    const scenarioPieces: ExportComponent[][] = [];

    if (scenarios) {
      scenarioPieces.push(
        ...(await Promise.all(
          scenarios.map((scenario) =>
            this.resolveForScenario(new ResourceId(scenario.id), kind),
          ),
        )),
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
      ...scenarioPieces.flat(),
    ];

    return components;
  }

  private async resolveForScenario(
    id: ResourceId,
    kind: ResourceKind,
  ): Promise<ExportComponent[]> {
    const pieces: ExportComponent[] = [
      ExportComponent.newOne(id, ClonePiece.ScenarioMetadata),
      ExportComponent.newOne(id, ClonePiece.ScenarioProtectedAreas),
    ];

    if (kind === ResourceKind.Scenario) {
      pieces.push(ExportComponent.newOne(id, ClonePiece.ExportConfig));
    }

    return pieces;
  }
}
