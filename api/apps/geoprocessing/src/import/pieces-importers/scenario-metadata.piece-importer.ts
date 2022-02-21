import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ImportJobInput, ImportJobOutput } from '@marxan/cloning';
import { ScenarioMetadataContent } from '@marxan/cloning/infrastructure/clone-piece-data/scenario-metadata';
import { FileRepository } from '@marxan/files-repository';
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
    private readonly fileRepository: FileRepository,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly entityManager: EntityManager,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(ScenarioMetadataPieceImporter.name);
  }

  isSupported(piece: ClonePiece): boolean {
    return piece === ClonePiece.ScenarioMetadata;
  }

  async run(input: ImportJobInput): Promise<ImportJobOutput> {
    const {
      importResourceId: projectId,
      componentResourceId: scenarioId,
      uris,
      piece,
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

    const scenarioMetadata: ScenarioMetadataContent = JSON.parse(
      stringScenarioMetadataOrError.right,
    );

    await this.entityManager.query(
      `
      INSERT INTO scenarios(id, name, description, project_id)
      VALUES ($1, $2, $3, $4)
    `,
      [
        scenarioId,
        scenarioMetadata.name,
        scenarioMetadata.description,
        projectId,
      ],
    );

    return {
      importId: input.importId,
      componentId: input.componentId,
      importResourceId: input.importResourceId,
      componentResourceId: input.componentResourceId,
      piece: input.piece,
    };
  }
}
