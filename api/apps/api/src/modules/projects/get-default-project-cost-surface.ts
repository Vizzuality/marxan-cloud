import { Project } from '@marxan-api/modules/projects/project.api.entity';

export const getDefaultCostSurfaceIdFromProject = (
  project: Project,
): string => {
  const defaultCostSurface = project.costSurfaces?.find(
    (costSurface) => costSurface.isDefault,
  );
  if (!defaultCostSurface) {
    throw new Error(
      `Could not get default Cost Surface for Project: ${project.id}`,
    );
  }
  return defaultCostSurface.id;
};
