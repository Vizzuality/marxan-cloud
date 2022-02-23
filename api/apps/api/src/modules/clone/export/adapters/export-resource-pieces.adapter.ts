import { ClonePiece, ResourceId, ResourceKind } from '@marxan/cloning/domain';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Scenario } from '../../../scenarios/scenario.api.entity';
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
    @InjectRepository(Scenario)
    private readonly scenarioRepository: Repository<Scenario>,
  ) {}

  resolveFor(id: ResourceId, kind: ResourceKind): Promise<ExportComponent[]> {
    return this.resolverMapping[kind](id, kind);
  }

  private async resolveForProject(
    id: ResourceId,
    kind: ResourceKind,
  ): Promise<ExportComponent[]> {
    const scenarios = await this.scenarioRepository.find({
      where: { projectId: id.value },
    });

    const scenarioPieces = await Promise.all(
      scenarios.map((scenario) =>
        this.resolveForScenario(new ResourceId(scenario.id), kind),
      ),
    );

    // TODO We should check project configuration before returning PlanningAreaCustom,
    // PlanningAreaGAdm or PlanningAreaGridCustom pieces
    return [
      ExportComponent.newOne(id, ClonePiece.ProjectMetadata),
      ExportComponent.newOne(id, ClonePiece.ExportConfig),
      // ExportComponent.newOne(id, ClonePiece.PlanningAreaCustom),
      // ExportComponent.newOne(id, ClonePiece.PlanningAreaGAdm),
      // ExportComponent.newOne(id, ClonePiece.PlanningAreaGridCustom),
      ...scenarioPieces.flat(),
    ];
  }

  private async resolveForScenario(
    id: ResourceId,
    kind: ResourceKind,
  ): Promise<ExportComponent[]> {
    const pieces: ExportComponent[] = [
      ExportComponent.newOne(id, ClonePiece.ScenarioMetadata),
    ];

    if (kind === ResourceKind.Scenario) {
      pieces.push(ExportComponent.newOne(id, ClonePiece.ExportConfig));
    }

    return pieces;
  }
}
