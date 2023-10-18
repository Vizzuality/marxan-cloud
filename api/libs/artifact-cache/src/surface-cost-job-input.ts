// These types are here for historical reasons and not related to Artefact Cache

export type FromProjectShapefileJobInput = {
  costSurfaceId: string;
  shapefile: Express.Multer.File;
  projectId: string;
};

export type InitialProjectCostInput = {
  projectId: string;
  costSurfaceId: string;
};

export type ProjectCostSurfaceJobInput =
  | FromProjectShapefileJobInput
  | InitialProjectCostInput;

export type LinkCostSurfaceToScenarioJobInput = {
  type: 'LinkCostSurfaceToScenarioJobInput';
  scenarioId: string;
  costSurfaceId: string;
  originalCostSurfaceId: string;

  mode: 'creation' | 'update';
};

export type ScenarioCostSurfaceJobInput = LinkCostSurfaceToScenarioJobInput;

/**
 * @note: we should deprecate all of the below
 */
export type ParentJobInput = {
  scenarioId: string;
};

export type FromShapefileJobInput = ParentJobInput & {
  shapefile: Express.Multer.File;
};

export type InitialCostJobInput = ParentJobInput;

export type JobInput = FromShapefileJobInput | InitialCostJobInput;

export const jobSubmissionFailed = Symbol('job submission failed');
