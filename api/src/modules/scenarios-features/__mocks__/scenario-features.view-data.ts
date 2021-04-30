import { RemoteFeaturesData } from '../entities/remote-features-data.geo.entity';
import { RemoteScenarioFeaturesData } from '../entities/remote-scenario-features-data.geo.entity';
import {
  FeatureTags,
  GeoFeature,
} from '../../geo-features/geo-feature.api.entity';

const featureIdMet = `feature-uuid-1-criteria-met`;
const featureIdFailed = `feature-uuid-2-criteria-failed`;

const metaFeatureIdMet = `meta-feature-uuid-1-criteria-met`;
const metaFeatureIdFailed = `meta-feature-uuid-1-criteria-failed`;

type RawRemoteScenarioFeaturesData = Pick<
  RemoteScenarioFeaturesData,
  | 'id'
  | 'target'
  | 'scenario_id'
  | 'fpf'
  | 'feature_class_id'
  | 'total_area'
  | 'current_pa'
  | 'target2'
>;

export const getValidNonGeoData = (
  scenarioId: string,
): [RawRemoteScenarioFeaturesData[], number] => [
  [
    {
      id: 'some-id',
      target: 50,
      scenario_id: scenarioId,
      fpf: 1,
      feature_class_id: featureIdMet,
      current_pa: '12000',
      total_area: '20000',
      target2: 0,
    },
    {
      id: 'some-another-id',
      target: 50,
      scenario_id: scenarioId,
      fpf: 1,
      feature_class_id: featureIdFailed,
      current_pa: '4000',
      total_area: '10000',
      target2: 0,
    },
  ],
  2,
];

export const getValidRemoteFeatureData = (): RemoteFeaturesData[] => [
  {
    feature_id: metaFeatureIdFailed,
    id: featureIdFailed,
  },
  {
    feature_id: metaFeatureIdMet,
    id: featureIdMet,
  },
];

export const getValidGeoFeature = (): GeoFeature[] => [
  {
    description: 'feature-desc-1',
    tag: FeatureTags.bioregional,
    id: metaFeatureIdMet,
    alias: 'feature-alias-1',
  },
  {
    description: 'feature-desc-2',
    tag: FeatureTags.species,
    id: metaFeatureIdFailed,
    alias: 'feature-alias-2',
  },
];
