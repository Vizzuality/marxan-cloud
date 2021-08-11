export enum SpecificationOperation {
  Split = 'split',
  Stratification = 'stratification',
  Copy = 'copy',
}

export interface FeatureState {
  id: string;
  calculated: boolean;
}

export interface FeatureSubSet {
  value: string;
  target?: number;
  fpf?: number;
  prop?: number;
}

interface FeatureConfigBase {
  operation: SpecificationOperation;
  baseFeatureId: string;
  splitByProperty?: string;
  againstFeatureId?: string;
  selectSubSets?: FeatureSubSet[];
  target?: number;
  fpf?: number;
  prop?: number;
}

export interface FeatureConfigStratification extends FeatureConfigBase {
  operation: SpecificationOperation.Stratification;
  baseFeatureId: string;
  againstFeatureId: string;
  splitByProperty?: string;
}

export interface FeatureConfigSplit extends FeatureConfigBase {
  operation: SpecificationOperation.Split;
  baseFeatureId: string;
  splitByProperty: string;
}

export interface FeatureConfigCopy extends FeatureConfigBase {
  operation: SpecificationOperation.Copy;
  baseFeatureId: string;
  selectSubSets: never;
}

export type FeatureConfigInput =
  | FeatureConfigStratification
  | FeatureConfigSplit
  | FeatureConfigCopy;

export interface FeatureConfig extends FeatureConfigBase {
  featuresDetermined: boolean;
  resultFeatures: FeatureState[];
}
