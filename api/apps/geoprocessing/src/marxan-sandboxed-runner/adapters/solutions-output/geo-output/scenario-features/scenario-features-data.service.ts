import { Injectable } from '@nestjs/common';
import { pipeline } from 'stream';
import { ScenarioFeatureRunData } from './scenario-feature-run-data';

import { ScenarioFeatureIdMapper } from './id-mapper/scenario-feature-id.mapper';
import { MvFileReader } from './file-reader/mv-file-reader';
import { OutputLineToDataTransformer } from './file-reader/output-line-to-data.transformer';

@Injectable()
export class ScenarioFeaturesDataService {
  constructor(
    private readonly scenarioIdMapper: ScenarioFeatureIdMapper,
    private readonly fileReader: MvFileReader,
  ) {}

  async from(
    outputDirectory: string,
    scenarioId: string,
  ): Promise<ScenarioFeatureRunData[]> {
    return new Promise(async (resolve, reject) => {
      const result: ScenarioFeatureRunData[] = [];
      const idMap = await this.scenarioIdMapper.getMapping(scenarioId);
      pipeline(
        this.fileReader.from(outputDirectory),
        new OutputLineToDataTransformer(idMap),
        (error) => {
          if (error) {
            return reject(error);
          }
          return resolve(result);
        },
      ).on(`data`, (data: ScenarioFeatureRunData) => {
        result.push(data);
      });
    });
  }
}
