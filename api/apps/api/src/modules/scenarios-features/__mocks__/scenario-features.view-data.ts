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
  | 'scenarioId'
  | 'fpf'
  | 'featuresDataId'
  | 'totalArea'
  | 'currentArea'
  | 'target2'
>;

export const getValidNonGeoData = (
  scenarioId: string,
): [RawRemoteScenarioFeaturesData[], number] => [
  [
    {
      id: 'some-id',
      target: 50,
      scenarioId,
      fpf: 1,
      featuresDataId: featureIdMet,
      currentArea: 12000,
      totalArea: 20000,
      target2: 0,
    },
    {
      id: 'some-another-id',
      target: 50,
      scenarioId,
      fpf: 1,
      featuresDataId: featureIdFailed,
      currentArea: 4000,
      totalArea: 10000,
      target2: 0,
    },
  ],
  2,
];

export const getValidRemoteFeatureData = (): RemoteFeaturesData[] => [
  {
    featureId: metaFeatureIdFailed,
    id: featureIdFailed,
  },
  {
    featureId: metaFeatureIdMet,
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
