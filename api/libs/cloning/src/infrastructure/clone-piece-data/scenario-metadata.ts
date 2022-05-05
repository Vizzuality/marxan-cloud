import { ScenarioMetadata } from '@marxan/scenario-metadata';
import { BlmRange } from './project-metadata';

export type ScenarioMetadataContent = {
  name: string;
  description?: string;
  numberOfRuns?: number;
  blm?: number;
  metadata?: ScenarioMetadata;
  blmRange: BlmRange;
};

export const scenarioMetadataRelativePath = `scenario-metadata.json`;
