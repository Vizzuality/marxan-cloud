import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ImportJobInput, ImportJobOutput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
import { ScenarioMetadataContent } from '@marxan/cloning/infrastructure/clone-piece-data/scenario-metadata';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import { extractFile } from '@marxan/utils';
import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/lib/Either';
import { EntityManager } from 'typeorm';
import {
  ImportPieceProcessor,
  PieceImportProvider,
} from '../pieces/import-piece-processor';

@Injectable()
@PieceImportProvider()
export class ScenarioMetadataPieceImporter implements ImportPieceProcessor {
  constructor(
    private readonly fileRepository: CloningFilesRepository,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly entityManager: EntityManager,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(ScenarioMetadataPieceImporter.name);
  }

  isSupported(piece: ClonePiece): boolean {
    return piece === ClonePiece.ScenarioMetadata;
  }

  private updateScenario(
    em: EntityManager,
    scenarioId: string,
    values: ScenarioMetadataContent,
  ) {
    return em
      .createQueryBuilder()
      .update('scenarios')
      .set({
        id: scenarioId,
        description: values.description,
        blm: values.blm,
        number_of_runs: values.numberOfRuns,
        metadata: values.metadata,
      })
      .where('id = :scenarioId', { scenarioId })
      .execute();
  }

  private createScenario(
    em: EntityManager,
    scenarioId: string,
    projectId: string,
    values: ScenarioMetadataContent,
  ) {
    return em
      .createQueryBuilder()
      .insert()
      .into('scenarios')
      .values({
        id: scenarioId,
        name: values.name,
        description: values.description,
        blm: values.blm,
        number_of_runs: values.numberOfRuns,
        metadata: values.metadata,
        project_id: projectId,
      })
      .execute();
  }

  async run(input: ImportJobInput): Promise<ImportJobOutput> {
    const {
      pieceResourceId: scenarioId,
      projectId,
      uris,
      piece,
      resourceKind,
      ownerId,
    } = input;

    if (uris.length !== 1) {
      const errorMessage = `uris array has an unexpected amount of elements: ${uris.length}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }
    const [scenarioMetadataLocation] = uris;

    const readableOrError = await this.fileRepository.get(
      scenarioMetadataLocation.uri,
    );

    if (isLeft(readableOrError)) {
      const errorMessage = `File with piece data for ${piece}/${scenarioId} is not available at ${scenarioMetadataLocation.uri}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    const stringScenarioMetadataOrError = await extractFile(
      readableOrError.right,
      scenarioMetadataLocation.relativePath,
    );
    if (isLeft(stringScenarioMetadataOrError)) {
      const errorMessage = `Scenario metadata file extraction failed: ${scenarioMetadataLocation.relativePath}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    const metadata: ScenarioMetadataContent = JSON.parse(
      stringScenarioMetadataOrError.right,
    );

    const scenarioCloning = resourceKind === ResourceKind.Scenario;

    await this.entityManager.transaction(async (em) => {
      if (scenarioCloning) {
        await this.updateScenario(em, scenarioId, metadata);
      } else {
        await this.createScenario(em, scenarioId, projectId, metadata);
      }
    });

    return {
      importId: input.importId,
      componentId: input.componentId,
      pieceResourceId: scenarioId,
      projectId,
      piece: input.piece,
    };
  }
}
