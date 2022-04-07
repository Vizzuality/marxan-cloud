import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';

export type ScenarioMetadataContent = {
  name: string;
  description?: string;
  numberOfRuns?: number;
  blm?: number;
  metadata?: Scenario['metadata'];
};

export const scenarioMetadataRelativePath = `scenario-metadata.json`;
