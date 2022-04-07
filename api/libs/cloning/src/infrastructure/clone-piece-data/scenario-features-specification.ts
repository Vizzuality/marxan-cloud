import { SpecificationOperation } from '@marxan-api/modules/specification';
import { SpecificationFeature } from '@marxan-api/modules/specification/adapters/specification-feature';
import { FeatureSubSet } from '@marxan-api/modules/specification/domain';

export const featuresSpecificationRelativePath = `features-specification.json`;

export type FeatureElement = {
  name: string;
  isCustom: boolean;
};

export type FeatureNumberCalculated = {
  featureId: number;
  calculated: boolean;
};
export type FeatureIdCalculated = { featureId: string; calculated: boolean };

export type FeaturesConfig = {
  baseFeature: string;
  againstFeature: string | null;
  operation: SpecificationOperation;
  featuresDetermined: boolean;
  splitByProperty: string | null;
  selectSubSets: FeatureSubSet[] | null;
  features: FeatureNumberCalculated[];
};
export type ScenarioFeaturesSpecificationContent = {
  raw: Record<string, any>;
  draft: boolean;
  configs: FeaturesConfig[];
};

export type ScenarioFeaturesSpecificationContentWithId = {
  id: string;
  raw: Record<string, any>;
  draft: boolean;
  configs: {
    baseFeatureId: string;
    againstFeatureId: string | null;
    operation: SpecificationOperation;
    featuresDetermined: boolean;
    splitByProperty: string | null;
    selectSubSets: FeatureSubSet[] | null;
    features: SpecificationFeature[];
  }[];
};

export function searchFeatureIdInObject(feature: any, results: string[]) {
  Object.keys(feature).forEach((key) => {
    if (typeof feature[key] === 'string' && key === 'featureId')
      results.push(feature[key]);
    if (typeof feature[key] === 'object')
      searchFeatureIdInObject(feature[key], results);
  });
}
export function parseFeatureIdInObject(
  feature: any,
  parseFeature: (feature: string) => string,
) {
  Object.keys(feature).forEach((key) => {
    if (typeof feature[key] === 'string' && key === 'featureId')
      feature[key] = parseFeature(feature[key]);
    if (typeof feature[key] === 'object')
      parseFeatureIdInObject(feature[key], parseFeature);
  });
}
