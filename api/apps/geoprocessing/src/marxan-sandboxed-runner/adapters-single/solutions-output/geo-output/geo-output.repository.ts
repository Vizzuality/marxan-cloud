import { EntityManager, In } from 'typeorm';
import { ConsoleLogger, Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { MetadataArchiver } from './metadata/data-archiver.service';
import { SolutionsReaderService } from './solutions/output-file-parsing/solutions-reader.service';
import { PlanningUnitSelectionCalculatorService } from './solutions/solution-aggregation/planning-unit-selection-calculator.service';
import { PlanningUnitsSelectionState } from './solutions/planning-unit-selection-state';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import {
  MarxanExecutionMetadataGeoEntity,
  OutputScenariosFeaturesDataGeoEntity,
  OutputScenariosPuDataGeoEntity,
} from '@marxan/marxan-output';
import { readFileSync } from 'fs';
import { ScenarioFeaturesDataService } from './scenario-features';
import { RunDirectories } from '../run-directories';
import { chunk } from 'lodash';

@Injectable()
export class GeoOutputRepository {
  constructor(
    private readonly metadataArchiver: MetadataArchiver,
    private readonly solutionsReader: SolutionsReaderService,
    private readonly scenarioFeaturesDataReader: ScenarioFeaturesDataService,
    private readonly planningUnitsStateCalculator: PlanningUnitSelectionCalculatorService,
    @InjectEntityManager(geoprocessingConnections.default)
    private readonly entityManager: EntityManager,
    private readonly logger: ConsoleLogger,
  ) {
    this.logger.setContext(GeoOutputRepository.name);
  }

  async save(
    scenarioId: string,
    runDirectories: RunDirectories,
    metaData: { stdOutput: string[]; stdError?: string[] },
  ): Promise<PlanningUnitsSelectionState> {
    const inputArchivePath = await this.metadataArchiver.zip(
      runDirectories.input,
    );
    const outputArchivePath = await this.metadataArchiver.zip(
      runDirectories.output,
    );

    const solutionsStream = await this.solutionsReader.from(
      runDirectories.output,
      scenarioId,
    );

    const planningUnitsState: PlanningUnitsSelectionState =
      await this.planningUnitsStateCalculator.consume(solutionsStream);

    const scenarioFeatureDataFromAllRuns =
      await this.scenarioFeaturesDataReader.from(
        runDirectories.output,
        scenarioId,
      );

    await this.entityManager.transaction(async (transaction) => {
      // We chunk delete and insert operations as the generated SQL statements
      // could otherwise easily end up including tens of thousands of
      // parameters, risking to hit PostgreSQL' limit for this when processing
      // large numbers of features and planning units (times the columns of data
      // to insert -- for insert operations).
      // Moreover, TypeORM seems to use up a disproportionate amount of memory
      // and CPU time when assembling large queries with tens of thousands or
      // parameters, which makes non-chunked operations block the event loop
      // for unacceptable amounts of time here.

      const CHUNK_SIZE_FOR_BATCH_DB_OPERATIONS = 1000;
      const CHUNK_SIZE_FOR_BATCH_SUMMARY = 1000;

      this.logger.debug(
        `Deleting ${
          Object.keys(planningUnitsState.puSelectionState).length
        } output scenario planning units...`,
      );
      for (const [index, ospuChunk] of chunk(
        Object.keys(planningUnitsState.puSelectionState),
        CHUNK_SIZE_FOR_BATCH_DB_OPERATIONS,
      ).entries()) {
        this.logger.debug(
          `Deleting chunk #${index} (${ospuChunk.length} items)...`,
        );
        await transaction.delete(OutputScenariosPuDataGeoEntity, {
          scenarioPuId: In(ospuChunk),
        });
      }

      this.logger.debug(
        `Deleting ${scenarioFeatureDataFromAllRuns.length} output scenario features...`,
      );
      for (const [index, osfdChunk] of chunk(
        scenarioFeatureDataFromAllRuns,
        CHUNK_SIZE_FOR_BATCH_DB_OPERATIONS,
      ).entries()) {
        this.logger.debug(
          `Deleting chunk #${index} (${osfdChunk.length} items)...`,
        );
        await transaction.delete(OutputScenariosFeaturesDataGeoEntity, {
          featureScenarioId: In(osfdChunk.map((e) => e.featureScenarioId)),
        });
      }

      this.logger.debug(
        `Inserting ${scenarioFeatureDataFromAllRuns.length} output scenario features...`,
      );
      for (const [index, osfdChunk] of chunk(
        scenarioFeatureDataFromAllRuns,
        CHUNK_SIZE_FOR_BATCH_DB_OPERATIONS,
      ).entries()) {
        this.logger.debug(
          `Inserting chunk #${index} (${osfdChunk.length} items)...`,
        );
        await transaction.insert(
          OutputScenariosFeaturesDataGeoEntity,
          osfdChunk,
        );
      }

      const chunkedOutputScenariosPuData = chunk(
        Object.entries(planningUnitsState.puSelectionState),
        CHUNK_SIZE_FOR_BATCH_SUMMARY,
      );

      this.logger.debug(
        `Inserting ${
          Object.keys(planningUnitsState.puSelectionState).length
        } output scenario planning units...`,
      );
      await Promise.all(
        chunkedOutputScenariosPuData.map((ospuChunk, index) => {
          this.logger.debug(
            `Inserting chunk #${index} (${ospuChunk.length} items)...`,
          );
          return ospuChunk.map(([scenarioPuId, data]) =>
            transaction.insert(OutputScenariosPuDataGeoEntity, {
              scenarioPuId,
              values: data.values,
              includedCount: data.usedCount,
            }),
          );
        }),
      );

      await transaction.save(
        transaction.create(MarxanExecutionMetadataGeoEntity, {
          scenarioId,
          stdOutput: metaData.stdOutput.toString(),
          stdError: metaData.stdError?.toString(),
          outputZip: readFileSync(outputArchivePath),
          inputZip: readFileSync(inputArchivePath),
        }),
      );
    });

    return planningUnitsState;
  }

  async saveFailure(
    scenarioId: string,
    input: string,
    metaData: { stdOutput: string[]; stdError?: string[] },
  ): Promise<void> {
    const inputArchivePath = await this.metadataArchiver.zip(input);
    await this.entityManager.save(
      this.entityManager.create(MarxanExecutionMetadataGeoEntity, {
        scenarioId,
        stdOutput: metaData.stdOutput.toString(),
        stdError: metaData.stdError?.toString(),
        inputZip: readFileSync(inputArchivePath),
        failed: true,
      }),
    );
  }
}
