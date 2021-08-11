import { FeatureConfig } from './feature-config';

export interface SpecificationSnapshotInput {
  id: string;
  scenarioId: string;
  config: FeatureConfig[];
  draft: boolean;
  raw: Record<string, unknown>;
}

export interface SpecificationSnapshot extends SpecificationSnapshotInput {
  readyToActivate: boolean;
  featuresDetermined: boolean;
}
