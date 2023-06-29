// These types are here for historical reasons and not related to Artefact Cache

export type ParentJobInput = {
  scenarioId: string;
};

export type FromShapefileJobInput = ParentJobInput & {
  shapefile: Express.Multer.File;
};

export type InitialCostJobInput = ParentJobInput;

export type JobInput = FromShapefileJobInput | InitialCostJobInput;

export const jobSubmissionFailed = Symbol('job submission failed');
