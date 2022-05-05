import { ScenarioMetadata } from '@marxan/scenario-metadata';
import { BlmRange } from './project-metadata';
import { ProjectCustomFeature } from './project-custom-features';

export type ScenarioMetadataContent = {
  name: string;
  description?: string;
  numberOfRuns?: number;
  blm?: number;
  metadata?: ScenarioMetadata;
  blmRange: BlmRange;
  status?: ProjectCustomFeature['creation_status'];
  ranAtLeastOnce: boolean;
  type: string;
};

export const scenarioMetadataRelativePath = `scenario-metadata.json`;
