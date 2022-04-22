import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput, ExportJobOutput } from '@marxan/cloning';
import { ComponentLocation, ResourceKind } from '@marxan/cloning/domain';
import { ClonePieceRelativePathResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import {
  exportVersion,
  ScenarioExportConfigContent,
} from '@marxan/cloning/infrastructure/clone-piece-data/export-config';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/Either';
import { Readable } from 'stream';
import { EntityManager } from 'typeorm';
import {
  ExportPieceProcessor,
  PieceExportProvider,
} from '../pieces/export-piece-processor';

@Injectable()
@PieceExportProvider()
export class ExportConfigScenarioPieceExporter implements ExportPieceProcessor {
  constructor(
    private readonly fileRepository: CloningFilesRepository,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly entityManager: EntityManager,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(ExportConfigScenarioPieceExporter.name);
  }

  isSupported(piece: ClonePiece, kind: ResourceKind): boolean {
    return piece === ClonePiece.ExportConfig && kind === ResourceKind.Scenario;
  }

  async run(input: ExportJobInput): Promise<ExportJobOutput> {
    const scenarioId = input.resourceId;
    const [scenario]: {
      name: string;
      project_id: string;
      description: string;
    }[] = await this.entityManager
      .createQueryBuilder()
      .select('name')
      .addSelect('project_id')
      .addSelect('description')
      .from('scenarios', 's')
      .where('id = :scenarioId', { scenarioId })
      .execute();

    if (!scenario) {
      const errorMessage = `Scenario with ID ${scenarioId} not found`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    const fileContent: ScenarioExportConfigContent = {
      version: exportVersion,
      name: scenario.name,
      description: scenario.description,
      projectId: scenario.project_id,
      resourceKind: input.resourceKind,
      resourceId: scenarioId,
      pieces: input.allPieces.map((elem) => elem.piece),
      isCloning: true,
    };

    const relativePath = ClonePieceRelativePathResolver.resolveFor(
      ClonePiece.ExportConfig,
    );

    const outputFile = await this.fileRepository.saveCloningFile(
      input.exportId,
      Readable.from(JSON.stringify(fileContent)),
      relativePath,
    );

    if (isLeft(outputFile)) {
      const errorMessage = `${ExportConfigScenarioPieceExporter.name} - Scenario - couldn't save file - ${outputFile.left.description}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    return {
      ...input,
      uris: [new ComponentLocation(outputFile.right, relativePath)],
    };
  }
}
