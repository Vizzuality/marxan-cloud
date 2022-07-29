import { GeometrySource } from '@marxan/geofeatures';

export const projectCustomFeaturesRelativePath = 'custom-features.json';

// @debt JobStatus is a duplicated type as it is declared here and in
// api/src/modules/scenarios/scenario.api.entity.ts
export enum JobStatus {
  draft = 'draft',
  created = 'created',
  running = 'running',
  canceled = 'canceled',
  done = 'done',
  failure = 'failure',
}

type FeatureData = {
  the_geom: string;
  properties: Record<string, string | number>;
  source: GeometrySource;
  amount_from_legacy_project: number | null;
  projectPuPuid: number | undefined;
};

export type ProjectCustomFeature = {
  feature_class_name: string;
  alias: string;
  description: string;
  property_name: string;
  intersection: string[];
  creation_status: JobStatus;
  list_property_keys: string[];
  is_legacy: boolean;
  data: FeatureData[];
};

export type ProjectCustomFeaturesContent = {
  features: ProjectCustomFeature[];
};
