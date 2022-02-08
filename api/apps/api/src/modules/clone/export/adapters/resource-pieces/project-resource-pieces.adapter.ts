import { ClonePiece, ResourceId, ResourceKind } from '@marxan/cloning/domain';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';
import { Scenario } from '../../../../scenarios/scenario.api.entity';
import { ResourcePieces } from '../../application/resource-pieces.port';
import { ExportComponentSnapshot } from '../../domain';
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
  ): Promise<ExportComponentSnapshot[]> {
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
      {
        id: v4(),
        resourceId: id.value,
        piece: ClonePiece.ProjectMetadata,
        finished: false,
        uris: [],
      },
      {
        id: v4(),
        resourceId: id.value,
        piece: ClonePiece.ExportConfig,
        finished: false,
        uris: [],
      },
      {
        id: v4(),
        resourceId: id.value,
        piece: ClonePiece.PlanningAreaCustom,
        finished: false,
        uris: [],
      },
      {
        id: v4(),
        resourceId: id.value,
        piece: ClonePiece.PlanningAreaGAdm,
        finished: false,
        uris: [],
      },
      {
        id: v4(),
        resourceId: id.value,
        piece: ClonePiece.PlanningAreaGridCustom,
        finished: false,
        uris: [],
      },
      ...scenarioPieces.flat(),
    ];
  }
}
