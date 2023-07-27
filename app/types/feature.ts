export interface Feature {
  id: string;
  type: 'geo_features';
  description: string;
  propertyName: string;
  isCustom: boolean;
  intersection: unknown;
  featureClassName: string;
  alias: string;
  scenarioUsageCount: number;
  tag?: string;
}
