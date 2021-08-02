export enum SpecificationOperation {
  Split = 'split',
  Stratification = 'stratification',
  Copy = 'copy',
}

export interface FeatureState {
  id: string;
  calculated: boolean;
}

export interface FeatureConfigInput {
  operation: SpecificationOperation;
  baseFeatureId: string;
  againstFeatureId?: string;
}

export interface FeatureConfig extends FeatureConfigInput {
  featuresDetermined: boolean;
  resultFeatures: FeatureState[];
}

// export class FeatureConfig {
//   constructor(
//     public readonly determined: boolean,
//     resultFeatures?: FeatureState[],
//   ) {}
// }
