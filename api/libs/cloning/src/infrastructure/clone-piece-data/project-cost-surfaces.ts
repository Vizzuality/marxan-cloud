import { GeometrySource } from '@marxan/geofeatures';

export const projectCostSurfacesRelativePath = 'cost-surfaces.json';

// @debt JobStatus is a duplicated type as it is declared here and in
// api/src/modules/scenarios/scenario.api.entity.ts
export enum JobStatus {
  draft = 'draft',
  created = 'created',
  running = 'running',
  canceled = 'canceled',
  done = 'done',
  failure = 'failure',
}

type CostSurfaceData = {
  cost: number;
  puid: number;
};

export type ProjectCostSurface = {
  name: string;
  min: number;
  max: number;
  is_default: boolean;
  data: CostSurfaceData[];
};

export type ProjectCostSurfacesContent = {
  costSurfaces: ProjectCostSurface[];
};
