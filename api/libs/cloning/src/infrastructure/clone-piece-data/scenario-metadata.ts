import { ScenarioMetadata } from '@marxan/scenario-metadata';

export type ScenarioMetadataContent = {
  name: string;
  description?: string;
  numberOfRuns?: number;
  blm?: number;
  metadata?: ScenarioMetadata;
};

export const scenarioMetadataRelativePath = `scenario-metadata.json`;
