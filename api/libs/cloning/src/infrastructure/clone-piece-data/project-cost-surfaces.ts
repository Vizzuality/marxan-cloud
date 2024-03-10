export const projectCostSurfacesRelativePath = 'cost-surfaces.json';

export type CostSurfaceData = {
  cost: number;
  puid: number;
};

export type ProjectCostSurface = {
  /**
   * The stable_id of the cost surface in the original project is stored as part
   * of the export, so that it can be used to port over as part of cloned
   * projects any links between scenarios and cost surfaces (since the former
   * are imported with a cost_surface_id matching the stable_id stored here, but
   * the corresponding cost surfaces are created with a new unique id in the
   * cloned project).
   */
  id: string;
  stable_id: string;
  name: string;
  min: number;
  max: number;
  is_default: boolean;
  data: CostSurfaceData[];
};

export type ProjectCostSurfacesContent = {
  costSurfaces: ProjectCostSurface[];
};
