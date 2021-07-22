import { OutputScenariosFeaturesDataGeoEntity } from '@marxan/marxan-output';

export type ScenarioFeatureData = Omit<
  OutputScenariosFeaturesDataGeoEntity,
  `id`
>;
