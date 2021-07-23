import { Injectable } from '@nestjs/common';
import { ScenarioFeatureRunData } from './scenario-feature-run-data';
import { Readable } from 'stronger-typed-streams';

import { ScenarioFeatureIdMapper } from './id-mapper/scenario-feature-id.mapper';
import { OutputLineToDataTransformer } from './file-reader/output-line-to-data.transformer';

@Injectable()
export class ScenarioFeaturesDataService {
  constructor(private readonly scenarioIdMapper: ScenarioFeatureIdMapper) {}

  async from(
    outputDirectory: string,
    scenarioId: string,
  ): Promise<ScenarioFeatureRunData[]> {
    return new Promise(async (resolve, reject) => {
      const result: ScenarioFeatureRunData[] = [];
      const idMap = await this.scenarioIdMapper.getMapping(scenarioId);
      console.log(`--- scenario features data mapping`, idMap);

      // const featureDataStream: Readable<ScenarioFeatureRunData> = this.filesReader
      //   .from(outputDirectory)
      //   .pipe(new OutputLineToDataTransformer(idMap));
      // featureDataStream.on('error', reject);
      // featureDataStream.on('end', () => resolve(result));
      // featureDataStream.on('data', (data) => {
      //   result.push(data);
      // });
    });
  }
}
