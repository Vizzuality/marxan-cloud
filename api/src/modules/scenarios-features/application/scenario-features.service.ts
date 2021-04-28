import { Injectable } from '@nestjs/common';
import { GetFeatureMetadata } from './ports/get-feature-metadata';
import { GetNonGeoFeatureData } from './ports/get-non-geo-feature-data';
import { ScenarioFeatureDto } from '../scenario-feature.dto';

@Injectable()
export class ScenarioFeaturesService {
  constructor(
    private readonly featureMetadata: GetFeatureMetadata,
    private readonly featureNonGeoData: GetNonGeoFeatureData,
  ) {}

  /**
   * debt: ideally, it should abstract from target DTO at all
   * @param scenarioId
   */
  async getFeatures(scenarioId: string): Promise<ScenarioFeatureDto[]> {
    const [meta, geo] = await Promise.all([
      this.featureMetadata.resolve(scenarioId),
      this.featureNonGeoData.resolve(scenarioId),
    ]);

    const candidates = meta
      .map((metadata) => ({
        ...metadata,
        // believe DB's constraints that data is there
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ...geo.find((g) => g.id === metadata.id)!,
      }))
      .filter((candidate) => candidate.fpf);

    return candidates.map((candidate) => ({
      ...candidate,
      onTarget:
        candidate.metArea >= candidate.totalArea * (candidate.target / 100),
      met: candidate.metArea / candidate.totalArea,
      targetArea: (candidate.totalArea * candidate.target) / 100,
    }));
  }
}
