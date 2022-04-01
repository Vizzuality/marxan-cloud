import { JobStatus } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { FeatureTag } from '../../../../features/src';
import { GeometrySource } from '../../../../geofeatures/src';

export const projectCustomFeaturesRelativePath = 'custom-features.json';

type FeatureData = {
  the_geom: string;
  properties: Record<string, string | number>;
  source: GeometrySource;
};

export type ProjectCustomFeature = {
  feature_class_name: string;
  alias: string;
  description: string;
  property_name: string;
  intersection: string[];
  tag: FeatureTag;
  creation_status: JobStatus;
  list_property_keys: string[];
  data: FeatureData[];
};

export type ProjectCustomFeaturesContent = {
  features: ProjectCustomFeature[];
};
