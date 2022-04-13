import { PlanningUnitGridShape } from '@marxan/scenarios-planning-unit';

export type ProjectMetadataContent = {
  name: string;
  description?: string;
  planningUnitGridShape?: PlanningUnitGridShape;
  projectAlreadyCreated: boolean;
};

export const projectMetadataRelativePath = 'project-metadata.json';
