import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ImportJobInput, ImportJobOutput } from '@marxan/cloning';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import { ResourceKind } from '@marxan/cloning/domain';
import { ScenarioMetadataContent } from '@marxan/cloning/infrastructure/clone-piece-data/scenario-metadata';
import { readableToBuffer } from '@marxan/utils';
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
  private readonly logger: Logger = new Logger(
    ScenarioMetadataPieceImporter.name,
  );

  constructor(
    private readonly fileRepository: CloningFilesRepository,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly entityManager: EntityManager,
  ) {}

  isSupported(piece: ClonePiece): boolean {
    return piece === ClonePiece.ScenarioMetadata;
  }

  private updateScenario(
    em: EntityManager,
    scenarioId: string,
    values: ScenarioMetadataContent,
    ownerId: string,
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
        ran_at_least_once: values.ranAtLeastOnce,
        type: values.type,
        status: values.status,
        created_by: ownerId,
        solutions_are_locked: values.solutionsAreLocked,
      })
      .where('id = :scenarioId', { scenarioId })
      .execute();
  }

  private createScenario(
    em: EntityManager,
    scenarioId: string,
    projectId: string,
    values: ScenarioMetadataContent,
    ownerId: string,
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
        ran_at_least_once: values.ranAtLeastOnce,
        type: values.type,
        status: values.status,
        created_by: ownerId,
        solutions_are_locked: values.solutionsAreLocked,
        cost_surface_id: values.cost_surface_id,
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
    } = input;

    try {
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

      const buffer = await readableToBuffer(readableOrError.right);
      const specificationaOrError = buffer.toString();

      const metadata: ScenarioMetadataContent = JSON.parse(
        specificationaOrError,
      );

      const scenarioCloning = resourceKind === ResourceKind.Scenario;

      await this.entityManager.transaction(async (em) => {
        if (scenarioCloning) {
          await this.updateScenario(em, scenarioId, metadata, input.ownerId);
        } else {
          /**
           * Aggressive locking on the table is used here in order to ensure that by the time
           * the trigger function that is executed on insert will not get stale data from
           * concurrent transactions. Inserting in serializable mode seems not to be enough,
           * from checks done when this lock was added.
           */
          await em.query('lock table scenarios');
          await this.createScenario(
            em,
            scenarioId,
            projectId,
            metadata,
            input.ownerId,
          );
        }

        await em
          .createQueryBuilder()
          .insert()
          .into('scenario_blms')
          .values({ id: scenarioId, ...metadata.blmRange })
          .execute();
      });
    } catch (e) {
      this.logger.error(e);
      throw e;
    }

    return {
      importId: input.importId,
      componentId: input.componentId,
      pieceResourceId: scenarioId,
      projectId,
      piece: input.piece,
    };
  }
}
