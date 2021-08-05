export enum SpecificationOperation {
  Split = 'split',
  Stratification = 'stratification',
  Copy = 'copy',
}

export interface FeatureState {
  id: string;
  calculated: boolean;
}

interface FeatureConfigBase {
  operation: SpecificationOperation;
  baseFeatureId: string;
  againstFeatureId?: string;
}

export interface FeatureConfigStratification extends FeatureConfigBase {
  operation: SpecificationOperation.Stratification;
  baseFeatureId: string;
  againstFeatureId: string;
}

export interface FeatureConfigDefault extends FeatureConfigBase {
  operation: SpecificationOperation.Copy | SpecificationOperation.Split;
  baseFeatureId: string;
}

export type FeatureConfigInput =
  | FeatureConfigStratification
  | FeatureConfigDefault;

export interface FeatureConfig extends FeatureConfigBase {
  featuresDetermined: boolean;
  resultFeatures: FeatureState[];
}
