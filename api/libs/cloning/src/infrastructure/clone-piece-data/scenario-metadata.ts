import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';

export type ScenarioMetadataContent = {
  name: string;
  description?: string;
  numberOfRuns?: number;
  blm?: number;
  metadata?: Scenario['metadata'];
};

export const scenarioMetadataRelativePath = {
  scenarioImport: `scenario-metadata.json`,
  projectImport: (oldScenarioId: string) =>
    `scenarios/${oldScenarioId}/scenario-metadata.json`,
};
