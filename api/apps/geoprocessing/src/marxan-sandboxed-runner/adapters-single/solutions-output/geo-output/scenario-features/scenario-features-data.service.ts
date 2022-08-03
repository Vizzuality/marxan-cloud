import { Injectable } from '@nestjs/common';
import { pipeline } from 'stream';
import { FeatureIdToScenarioFeatureData } from './feature-id-to-scenario-feature-data';
import { MvFileReader } from './file-reader/mv-file-reader';
import { OutputLineToDataTransformer } from './file-reader/output-line-to-data.transformer';
import { LegacyProjectImportScenarioFeatureIdMapper } from './id-mapper/legacy-project-import-scenario-feature-id.mapper';
import { ScenarioFeatureIdMapper } from './id-mapper/scenario-feature-id.mapper';
import { ScenarioFeatureRunData } from './scenario-feature-run-data';

@Injectable()
export class ScenarioFeaturesDataService {
  constructor(
    private readonly scenarioIdMapper: ScenarioFeatureIdMapper,
    private readonly legacyProjectImportScenarioIdMapper: LegacyProjectImportScenarioFeatureIdMapper,
    private readonly fileReader: MvFileReader,
  ) {}

  private async getIdMap(
    scenarioId: string,
    legacyProjectImport: boolean,
  ): Promise<FeatureIdToScenarioFeatureData> {
    return (legacyProjectImport
      ? this.legacyProjectImportScenarioIdMapper
      : this.scenarioIdMapper
    ).getMapping(scenarioId);
  }

  async from(
    outputDirectory: string,
    scenarioId: string,
    extension: 'csv' | 'txt' | 'dat' = 'csv',
    legacyProjectImport = false,
  ): Promise<ScenarioFeatureRunData[]> {
    return new Promise(async (resolve, reject) => {
      const result: ScenarioFeatureRunData[] = [];
      const idMap = await this.getIdMap(scenarioId, legacyProjectImport);
      pipeline(
        this.fileReader.from(outputDirectory, extension),
        new OutputLineToDataTransformer(idMap),
        (error) => {
          if (error) {
            return reject(error);
          }
          return resolve(result);
        },
      ).on(`data`, (data: ScenarioFeatureRunData | undefined) => {
        if (data) result.push(data);
      });
    });
  }
}
