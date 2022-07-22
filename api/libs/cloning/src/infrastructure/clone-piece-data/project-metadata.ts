import { ProjectSourcesEnum } from '@marxan/projects';
import { PlanningUnitGridShape } from '@marxan/scenarios-planning-unit';

export type BlmRange = {
  values: number[];
  defaults: number[];
  range: number[];
};

export type ProjectMetadataContent = {
  name: string;
  description?: string;
  planningUnitGridShape?: PlanningUnitGridShape;
  blmRange: BlmRange;
  metadata?: Record<string, unknown>;
  sources: ProjectSourcesEnum;
};

export const projectMetadataRelativePath = 'project-metadata.json';
