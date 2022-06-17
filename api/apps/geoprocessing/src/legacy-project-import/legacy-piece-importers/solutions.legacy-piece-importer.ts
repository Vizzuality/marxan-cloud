import {
  LegacyProjectImportFilesRepository,
  LegacyProjectImportFileType,
  LegacyProjectImportJobInput,
  LegacyProjectImportJobOutput,
  LegacyProjectImportPiece,
} from '@marxan/legacy-project-import';
import {
  OutputScenariosFeaturesDataGeoEntity,
  OutputScenariosPuDataGeoEntity,
  ScenariosOutputResultsApiEntity,
} from '@marxan/marxan-output';
import { FileService } from '@marxan/shapefile-converter';
import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/lib/Either';
import { promises, readdirSync } from 'fs';
import { chunk } from 'lodash';
import * as path from 'path';
import { EntityManager } from 'typeorm';
import {
  ScenarioFeatureRunData,
  ScenarioFeaturesDataService,
} from '../../marxan-sandboxed-runner/adapters-single/solutions-output/geo-output/scenario-features';
import { SolutionsReaderService } from '../../marxan-sandboxed-runner/adapters-single/solutions-output/geo-output/solutions/output-file-parsing/solutions-reader.service';
import { PlanningUnitsSelectionState } from '../../marxan-sandboxed-runner/adapters-single/solutions-output/geo-output/solutions/planning-unit-selection-state';
import { PlanningUnitSelectionCalculatorService } from '../../marxan-sandboxed-runner/adapters-single/solutions-output/geo-output/solutions/solution-aggregation/planning-unit-selection-calculator.service';
import { ResultParserService } from '../../marxan-sandboxed-runner/adapters-single/solutions-output/result-parser.service';
import { geoprocessingConnections } from '../../ormconfig';
import {
  LegacyProjectImportPieceProcessor,
  LegacyProjectImportPieceProcessorProvider,
} from '../pieces/legacy-project-import-piece-processor';

type SolutionsFileExtension = 'dat' | 'csv' | 'txt';

@Injectable()
@LegacyProjectImportPieceProcessorProvider()
export class SolutionsLegacyProjectPieceImporter
  implements LegacyProjectImportPieceProcessor {
  constructor(
    private readonly filesRepo: LegacyProjectImportFilesRepository,
    private readonly filesService: FileService,
    private readonly scenarioFeaturesDataService: ScenarioFeaturesDataService,
    private readonly solutionsReader: SolutionsReaderService,
    private readonly planningUnitsStateCalculator: PlanningUnitSelectionCalculatorService,
    private readonly resultParserService: ResultParserService,
    @InjectEntityManager(geoprocessingConnections.default.name)
    private readonly geoEntityManager: EntityManager,
    @InjectEntityManager(geoprocessingConnections.apiDB.name)
    private readonly apiEntityManager: EntityManager,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(SolutionsLegacyProjectPieceImporter.name);
  }

  isSupported(piece: LegacyProjectImportPiece): boolean {
    return piece === LegacyProjectImportPiece.Solutions;
  }

  private logAndThrow(message: string): never {
    this.logger.error(message);
    throw new Error(message);
  }

  private ensureThatOutputFileExists(
    outputFolder: string,
    fileName: string,
  ): SolutionsFileExtension {
    const solutionsFileExtension: SolutionsFileExtension[] = [
      'dat',
      'csv',
      'txt',
    ];

    const file = readdirSync(outputFolder, {
      encoding: `utf8`,
      withFileTypes: true,
    }).find((file) => file.isFile() && file.name.startsWith(fileName));

    if (!file) this.logAndThrow(`output.zip does not contain ${fileName}`);

    const tokens = file.name.split('.');
    const extension = tokens[tokens.length - 1] as SolutionsFileExtension;

    if (solutionsFileExtension.includes(extension)) {
      return extension;
    }

    this.logAndThrow(`${fileName} file has an unknown extension: ${extension}`);
  }

  private async insertOutputScenarioFeaturesData(
    em: EntityManager,
    records: ScenarioFeatureRunData[],
  ): Promise<void> {
    const chunkSize = 1000;

    await Promise.all(
      chunk(records, chunkSize).map((values) =>
        em.insert(OutputScenariosFeaturesDataGeoEntity, values),
      ),
    );
  }

  private async insertOutputScenariosPuData(
    em: EntityManager,
    planningUnitsState: PlanningUnitsSelectionState,
  ): Promise<void> {
    const chunkSize = 1000;

    await Promise.all(
      chunk(Object.entries(planningUnitsState.puSelectionState), chunkSize).map(
        (ospuChunk) => {
          const insertValues = ospuChunk.map(([scenarioPuId, data]) => ({
            scenarioPuId,
            values: data.values,
            includedCount: data.usedCount,
          }));

          return em.insert(OutputScenariosPuDataGeoEntity, insertValues);
        },
      ),
    );
  }

  private async insertOutputScenariosSummaries(
    em: EntityManager,
    outputSumPath: string,
    planningUnitsState: PlanningUnitsSelectionState,
    scenarioId: string,
  ): Promise<void> {
    const buffer = await promises.readFile(outputSumPath);
    const runsSummary = buffer.toString();

    const results = await this.resultParserService.parse(
      runsSummary,
      planningUnitsState,
    );

    await em.save(
      ScenariosOutputResultsApiEntity,
      results.map(({ score, cost, ...runSummary }) => ({
        ...runSummary,
        scoreValue: score,
        costValue: cost,
        scenarioId,
      })),
    );
  }

  private async updateScenario(
    em: EntityManager,
    scenarioId: string,
  ): Promise<void> {
    await em
      .createQueryBuilder()
      .update('scenarios')
      .set({
        ran_at_least_once: true,
      })
      .where('id = :scenarioId', { scenarioId })
      .execute();
  }

  async run(
    input: LegacyProjectImportJobInput,
  ): Promise<LegacyProjectImportJobOutput> {
    const { files, scenarioId } = input;

    const outputZip = files.find(
      (file) => file.type === LegacyProjectImportFileType.Output,
    );

    if (!outputZip)
      this.logAndThrow('output.zip file was not found inside input file array');

    const outputZipReadableOrError = await this.filesRepo.get(
      outputZip.location,
    );

    if (isLeft(outputZipReadableOrError))
      this.logAndThrow('output.zip file was not found in files repo');

    const origin = outputZip.location;
    const fileName = outputZip.type;
    const destination = path.dirname(origin);
    const outputFolder = path.join(
      destination,
      path.basename(fileName, '.zip'),
    );

    await this.filesService.unzipFile(origin, fileName, destination);

    const missingValuesFileNames = 'output_mv';
    const missingValuesFileNameExtension = this.ensureThatOutputFileExists(
      outputFolder,
      missingValuesFileNames,
    );
    const legacyProjectImport = true;
    const scenarioFeatureRunData = await this.scenarioFeaturesDataService.from(
      outputFolder,
      scenarioId,
      missingValuesFileNameExtension,
      legacyProjectImport,
    );

    const solutionsMatrixFileName = 'output_solutionsmatrix';
    const solutionsMatrixFileNameExtension = this.ensureThatOutputFileExists(
      outputFolder,
      solutionsMatrixFileName,
    );
    const solutionsStream = await this.solutionsReader.from(
      outputFolder,
      scenarioId,
      solutionsMatrixFileNameExtension,
    );
    const planningUnitsState = await this.planningUnitsStateCalculator.consume(
      solutionsStream,
    );

    const outputSumFileName = 'output_sum';
    const outputSumFileNameExtension = this.ensureThatOutputFileExists(
      outputFolder,
      outputSumFileName,
    );
    const outputSumPath = `${outputFolder}/${outputSumFileName}.${outputSumFileNameExtension}`;

    await this.geoEntityManager.transaction(async (em) => {
      await this.insertOutputScenarioFeaturesData(em, scenarioFeatureRunData);
      await this.insertOutputScenariosPuData(em, planningUnitsState);

      await this.apiEntityManager.transaction(async (apiEm) => {
        await this.insertOutputScenariosSummaries(
          apiEm,
          outputSumPath,
          planningUnitsState,
          scenarioId,
        );
        await this.updateScenario(apiEm, scenarioId);
      });
    });

    return input;
  }
}
