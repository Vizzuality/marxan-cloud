import { Module } from '@nestjs/common';
import { ExtractCostSurface, SurfaceCostService } from './extract-cost-surface';
import {
  ExtractSurfaceCostFromShapefile,
  ShapefileSurfaceCostService,
} from './shapefile-surface-cost';
import { ShapeFileService } from './shapefiles.service';

/**
 * Module purposes:
 *
 * - handle input shapefiles and convert them to GeoJson (ShapeFileService)
 * - extract surface cost from shapefiles for Planning Units (ExtractSurfaceCostFromShapefile)
 *
 */
@Module({
  providers: [
    {
      provide: ExtractSurfaceCostFromShapefile,
      useClass: ShapefileSurfaceCostService,
    },
    // TODO debt - include shapefiles service and change its usage
    ShapeFileService,
    // internal
    {
      provide: ExtractCostSurface,
      useClass: SurfaceCostService,
    },
  ],
  exports: [ShapeFileService, ExtractSurfaceCostFromShapefile],
})
export class ShapefilesModule {}
