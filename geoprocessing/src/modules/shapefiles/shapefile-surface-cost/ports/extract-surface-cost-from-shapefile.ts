import { ShapefileSurfaceCostInput } from './shapefile-surface-cost-input';
import { PlanningUnitCost } from './planning-unit-cost';

export abstract class ExtractSurfaceCostFromShapefile {
  abstract extract(
    input: ShapefileSurfaceCostInput,
  ): Promise<PlanningUnitCost[]>;
}
