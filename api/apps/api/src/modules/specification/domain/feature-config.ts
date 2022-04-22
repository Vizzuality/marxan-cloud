import { FeatureSubSet, SpecificationOperation } from '@marxan/specification';

export interface FeatureState {
  id?: string;
  featureId: string;
  calculated: boolean;
}

interface FeatureConfigBase {
  id?: string;
  operation: SpecificationOperation;
  baseFeatureId: string;
  splitByProperty?: string;
  againstFeatureId?: string;
  selectSubSets?: FeatureSubSet[];
  target?: number;
  fpf?: number;
  prop?: number;
}

export interface FeatureConfigStratification
  extends Omit<FeatureConfigBase, 'target' | 'fpf' | 'prop'> {
  operation: SpecificationOperation.Stratification;
  baseFeatureId: string;
  againstFeatureId: string;
  splitByProperty?: string;
}

export interface FeatureConfigSplit
  extends Omit<FeatureConfigBase, 'target' | 'fpf' | 'prop'> {
  operation: SpecificationOperation.Split;
  splitByProperty: string;
}

export interface FeatureConfigCopy extends FeatureConfigBase {
  operation: SpecificationOperation.Copy;
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
