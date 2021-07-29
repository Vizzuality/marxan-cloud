import { EntityManager, In } from 'typeorm';
import { Injectable } from '@nestjs/common';
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

@Injectable()
export class GeoOutputRepository {
  constructor(
    private readonly metadataArchiver: MetadataArchiver,
    private readonly solutionsReader: SolutionsReaderService,
    private readonly scenarioFeaturesDataReader: ScenarioFeaturesDataService,
    private readonly planningUnitsStateCalculator: PlanningUnitSelectionCalculatorService,
    @InjectEntityManager(geoprocessingConnections.default)
    private readonly entityManager: EntityManager,
  ) {}

  async save(
    scenarioId: string,
    runDirectories: RunDirectories,
    metaData: { stdOutput: string[]; stdErr?: string[] },
  ): Promise<void> {
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

    const planningUnitsState: PlanningUnitsSelectionState = await this.planningUnitsStateCalculator.consume(
      solutionsStream,
    );

    const scenarioFeatureDataFromAllRuns = await this.scenarioFeaturesDataReader.from(
      runDirectories.output,
      scenarioId,
    );

    return this.entityManager.transaction(async (transaction) => {
      await transaction.delete(OutputScenariosPuDataGeoEntity, {
        scenarioPuId: In(Object.keys(planningUnitsState)),
      });

      await transaction.delete(OutputScenariosFeaturesDataGeoEntity, {
        featureScenarioId: In(
          scenarioFeatureDataFromAllRuns.map((e) => e.featureScenarioId),
        ),
      });

      await transaction.insert(
        OutputScenariosFeaturesDataGeoEntity,
        scenarioFeatureDataFromAllRuns,
      );

      await Promise.all(
        Object.entries(planningUnitsState).map(([scenarioPuId, data]) =>
          transaction.insert(OutputScenariosPuDataGeoEntity, {
            scenarioPuId,
            values: data.values,
            includedCount: data.usedCount,
          }),
        ),
      );

      await transaction.save(
        transaction.create(MarxanExecutionMetadataGeoEntity, {
          scenarioId,
          stdOutput: metaData.stdOutput.toString(),
          stdError: metaData.stdErr?.toString(),
          outputZip: readFileSync(outputArchivePath),
          inputZip: readFileSync(inputArchivePath),
        }),
      );
    });
  }
}
