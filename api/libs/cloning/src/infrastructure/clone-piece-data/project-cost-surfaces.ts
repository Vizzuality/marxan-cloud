export const projectCostSurfacesRelativePath = 'cost-surfaces.json';

export type CostSurfaceData = {
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
