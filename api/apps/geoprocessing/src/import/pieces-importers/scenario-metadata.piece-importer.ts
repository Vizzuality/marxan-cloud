import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ImportJobInput, ImportJobOutput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
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

    const {
      name,
      blm,
      description,
      metadata,
      numberOfRuns,
    }: ScenarioMetadataContent = JSON.parse(
      stringScenarioMetadataOrError.right,
    );

    await this.entityManager.transaction(async (em) => {
      await em
        .createQueryBuilder()
        .insert()
        .into('scenarios')
        .values({
          id: scenarioId,
          name,
          description,
          blm,
          number_of_runs: numberOfRuns,
          metadata,
          project_id: projectId,
        })
        .execute();

      if (resourceKind === ResourceKind.Scenario) {
        await em
          .createQueryBuilder()
          .insert()
          .into(`users_scenarios`)
          .values({
            user_id: ownerId,
            scenario_id: scenarioId,
            // It would be great to use ScenarioRoles enum instead of having
            // the role hardcoded. The thing is that Geoprocessing code shouldn't depend
            // directly on elements of Api code, so there were two options:
            // - Move ScenarioRoles enum to libs package
            // - Harcode the rol
            // We took the second approach because we are only referencing values from that enum
            // here
            role_id: 'scenario_owner',
          })
          .execute();
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
