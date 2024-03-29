import { ScenarioFeaturesData } from '@marxan/features';
import { GeoFeature } from '../../geo-features/geo-feature.api.entity';

const featureIdMet = `feature-uuid-1-criteria-met`;
const featureIdFailed = `feature-uuid-2-criteria-failed`;

const metaFeatureIdMet = `meta-feature-uuid-1-criteria-met`;
const metaFeatureIdFailed = `meta-feature-uuid-1-criteria-failed`;

type RawRemoteScenarioFeaturesData = Pick<
  ScenarioFeaturesData,
  | 'id'
  | 'target'
  | 'scenarioId'
  | 'fpf'
  | 'featureDataId'
  | 'totalArea'
  | 'currentArea'
  | 'target2'
  | 'apiFeatureId'
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
      featureDataId: featureIdMet,
      currentArea: 12000,
      totalArea: 20000,
      target2: 0,
      apiFeatureId: metaFeatureIdMet,
    },
    {
      id: 'some-another-id',
      target: 50,
      scenarioId,
      fpf: 1,
      featureDataId: featureIdFailed,
      currentArea: 4000,
      totalArea: 10000,
      target2: 0,
      apiFeatureId: metaFeatureIdFailed,
    },
  ],
  2,
];

export const getValidGeoFeature = (): GeoFeature[] => {
  const entity1 = new GeoFeature();
  entity1.id = metaFeatureIdMet;
  entity1.alias = 'feature-alias-1';
  entity1.description = 'feature-desc-1';

  const entity2 = new GeoFeature();
  entity2.id = metaFeatureIdFailed;
  entity2.alias = 'feature-alias-2';
  entity2.description = 'feature-desc-2';

  return [entity1, entity2];
};
