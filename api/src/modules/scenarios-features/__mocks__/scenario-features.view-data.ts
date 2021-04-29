import { ScenariosFeaturesView } from '../entities/scenarios-features.view.api.entity';
import { RemoteScenarioFeaturesData } from '../entities/remote-scenario-features-data.geo.entity';

const featureIdMet = `feature-uuid-1-criteria-met`;
const featureIdFailed = `feature-uuid-2-criteria-failed`;

export const getValidScenarioFeatures = (
  scenarioId: string,
): [ScenariosFeaturesView[], number] => [
  [
    {
      id: scenarioId,
      tag: `scenario-1-tag`,
      description: `scenario-desc`,
      featureid: featureIdMet,
      projectid: `project-uuid-1`,
      name: `feature-name`,
    },
    {
      id: scenarioId,
      tag: `scenario-1-tag`,
      description: `scenario-desc`,
      featureid: featureIdFailed,
      projectid: `project-uuid-1`,
      name: `feature-name`,
    },
  ],
  2,
];

export const getValidNonGeoData = (
  scenarioId: string,
): RemoteScenarioFeaturesData[] => [
  {
    id: featureIdMet,
    target: 50,
    scenario_id: scenarioId,
    spf: 1,
    feature_class_id: `feature-class-id`,
    current_pa: '12000',
    total_area: '20000',
    target2: 0,
  },
  {
    id: featureIdFailed,
    target: 50,
    scenario_id: scenarioId,
    spf: 1,
    feature_class_id: `feature-class-id`,
    current_pa: '4000',
    total_area: '10000',
    target2: 0,
  },
];
