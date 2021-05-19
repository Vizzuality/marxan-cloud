import { Injectable } from '@nestjs/common';
import { ExtractSurfaceCostFromShapefile } from './ports/extract-surface-cost-from-shapefile';
import { PlanningUnitCost } from './ports/planning-unit-cost';
import { ShapefileSurfaceCostInput } from './ports/shapefile-surface-cost-input';

import { ShapeFileService } from '../shapefiles.service';
import { ExtractCostSurface } from '../extract-cost-surface';

@Injectable()
export class ShapefileSurfaceCostService
  implements ExtractSurfaceCostFromShapefile {
  constructor(
    private readonly fileConverter: ShapeFileService,
    private readonly extractor: ExtractCostSurface,
  ) {}

  // TODO tests
  async extract(input: ShapefileSurfaceCostInput): Promise<PlanningUnitCost[]> {
    // TODO fix typings in getGeoJson
    const { data: geo } = await this.fileConverter.getGeoJson(input.shapefile);

    // TODO extract PU ids & surface cost
    return this.extractor.extract({ geo });
  }
}
