import { ScenarioFeatureDto } from '../../scenario-feature.dto';

export type FeatureNumbers = Pick<
  ScenarioFeatureDto,
  'fpf' | 'target' | 'metArea' | 'id' | 'totalArea'
>;

export abstract class GetNonGeoFeatureData {
  abstract resolve(scenarioId: string): Promise<FeatureNumbers[]>;
}
