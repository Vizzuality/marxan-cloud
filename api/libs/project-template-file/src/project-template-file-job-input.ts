export type ParentJobInput = {
  projectId: string;
};

export type FromShapefileJobInput = ParentJobInput & {
  shapefile: Express.Multer.File;
};

export type InitialCostJobInput = ParentJobInput;

export type JobInput = FromShapefileJobInput | InitialCostJobInput;

export const jobSubmissionFailed = Symbol('job submission failed');
