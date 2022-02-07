import { PlanningUnitGridShape } from '../../scenarios-planning-unit/src/planning-unit-grid-shape';

export type ParentJobInput = {
  scenarioId: string;
};

export type FromShapefileJobInput = ParentJobInput & {
  shapefile: Express.Multer.File;
};

export type InitialCostJobInput = ParentJobInput & {
  puGridShape: PlanningUnitGridShape;
};

export type JobInput = FromShapefileJobInput | InitialCostJobInput;
