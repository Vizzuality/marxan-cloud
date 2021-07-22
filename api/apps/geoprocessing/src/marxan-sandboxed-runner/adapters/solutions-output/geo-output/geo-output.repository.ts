import { EntityManager, In } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';

import { Workspace } from '../../../ports/workspace';
import { MetadataArchiver } from './metadata/data-archiver.service';
import { SolutionsReaderService } from './solutions/output-file-parsing/solutions-reader.service';
import { PlanningUnitSelectionCalculatorService } from './solutions/solution-aggregation/planning-unit-selection-calculator.service';
import { PlanningUnitsSelectionState } from './solutions/planning-unit-selection-state';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import {
  MarxanExecutionMetadataGeoEntity,
  OutputScenariosPuDataGeoEntity,
} from '@marxan/marxan-output';
import { readFileSync } from 'fs';
import { ScenarioFeaturesDataService } from './scenario-features/scenario-features-data.service';

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
    workspace: Workspace,
    metaData: {
      stdOutput: string[];
      stdErr?: string[];
    },
  ): Promise<void> {
    const inputArchivePath = await this.metadataArchiver.zipInput(workspace);
    const outputArchivePath = await this.metadataArchiver.zipOutput(workspace);

    const solutionMatrix =
      workspace.workingDirectory + `/output/output_solutionsmatrix.csv`;

    const solutionsStream = await this.solutionsReader.from(
      solutionMatrix,
      scenarioId,
    );

    const planningUnitsState: PlanningUnitsSelectionState = await this.planningUnitsStateCalculator.consume(
      solutionsStream,
    );

    // TODO grab data from ScenarioFeaturesDataService
    const _sfds = await this.scenarioFeaturesDataReader.from(
      workspace.workingDirectory,
      scenarioId,
    );

    return this.entityManager.transaction(async (transaction) => {
      await transaction.delete(OutputScenariosPuDataGeoEntity, {
        scenarioPuId: In(Object.keys(planningUnitsState)),
      });

      // TODO clean ScenarioFeaturesData
      // TODO add ScenarioFeaturesData new data

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
