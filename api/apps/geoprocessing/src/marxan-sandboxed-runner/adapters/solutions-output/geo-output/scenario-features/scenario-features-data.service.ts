import { Injectable } from '@nestjs/common';
import { ScenarioFeatureData } from './scenario-feature-data';
import { ScenarioFeatureIdMapper } from './id-mapper/scenario-feature-id.mapper';
import { Readable } from 'stronger-typed-streams';
import { OutputLineToDataTransformer } from '@marxan-geoprocessing/marxan-sandboxed-runner/adapters/solutions-output/geo-output/scenario-features/file-reader/output-line-to-data.transformer';

@Injectable()
export class ScenarioFeaturesDataService {
  // iterate over all mv* files
  // stream their content to transformer

  constructor(private readonly scenarioIdMapper: ScenarioFeatureIdMapper) {}

  async from(
    outputDirectory: string,
    scenarioId: string,
  ): Promise<ScenarioFeatureData[]> {
    return new Promise(async (resolve, reject) => {
      const result: ScenarioFeatureData[] = [];
      const idMap = await this.scenarioIdMapper.getMapping(scenarioId);
      console.log(`--- scenario features data mapping`, idMap);

      const featureDataStream: Readable<ScenarioFeatureData> = this.filesReader
        .from(outputDirectory)
        .pipe(new OutputLineToDataTransformer(idMap));
      featureDataStream.on('error', reject);
      featureDataStream.on('end', () => resolve(result));
      featureDataStream.on('data', (data) => {
        result.push(data);
      });
    });
  }
}
