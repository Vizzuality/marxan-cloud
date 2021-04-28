import { ScenarioFeatureDto } from '../../scenario-feature.dto';

export type FeatureMetadata = Pick<ScenarioFeatureDto, 'tag' | 'name' | 'id'>;

export abstract class GetFeatureMetadata {
  abstract resolve(scenarioId: string): Promise<FeatureMetadata[]>;
}
