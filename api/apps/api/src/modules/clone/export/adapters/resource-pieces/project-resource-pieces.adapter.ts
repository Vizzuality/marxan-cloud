import { ClonePiece, ResourceId, ResourceKind } from '@marxan/cloning/domain';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Scenario } from '../../../../scenarios/scenario.api.entity';
import { ResourcePieces } from '../../application/resource-pieces.port';
import { ExportComponent } from '../../domain';
import { ResourcePiecesProvider } from '../resource-pieces.adapter';
import { ScenarioResourcePiecesAdapter } from './scenario-resource-pieces.adapter';

@Injectable()
@ResourcePiecesProvider(ResourceKind.Project)
export class ProjectResourcePiecesAdapter implements ResourcePieces {
  constructor(
    @InjectRepository(Scenario)
    private readonly scenarioRepository: Repository<Scenario>,
    private readonly scenarioResourcePieces: ScenarioResourcePiecesAdapter,
  ) {}

  async resolveFor(
    id: ResourceId,
    kind: ResourceKind,
  ): Promise<ExportComponent[]> {
    const scenarios = await this.scenarioRepository.find({
      where: { projectId: id.value },
    });

    const scenarioPieces = await Promise.all(
      scenarios.map((scenario) =>
        this.scenarioResourcePieces.resolveFor(
          new ResourceId(scenario.id),
          kind,
        ),
      ),
    );

    return [
      ExportComponent.newOne(id, ClonePiece.ProjectMetadata),
      ExportComponent.newOne(id, ClonePiece.ExportConfig),
      ExportComponent.newOne(id, ClonePiece.PlanningAreaCustom),
      ExportComponent.newOne(id, ClonePiece.PlanningAreaGAdm),
      ExportComponent.newOne(id, ClonePiece.PlanningAreaGridCustom),
      ...scenarioPieces.flat(),
    ];
  }
}
