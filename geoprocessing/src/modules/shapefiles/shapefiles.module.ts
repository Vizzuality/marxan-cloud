import { Module } from '@nestjs/common';
import { ExtractCostSurface, SurfaceCostService } from './extract-cost-surface';
import {
  ExtractSurfaceCostFromShapefile,
  ShapefileSurfaceCostService,
} from './shapefile-surface-cost';
import { ShapefileService } from './shapefiles.service';
import { FilesModule } from '../files/files.module';

/**
 * Module purposes:
 *
 * - handle input shapefiles and convert them to GeoJson (ShapeFileService)
 * - extract surface cost from shapefiles for Planning Units (ExtractSurfaceCostFromShapefile)
 *
 */
@Module({
  imports: [FilesModule],
  providers: [
    {
      provide: ExtractSurfaceCostFromShapefile,
      useClass: ShapefileSurfaceCostService,
    },
    // TODO debt - include shapefiles service and change its usage
    ShapefileService,
    // internal
    {
      provide: ExtractCostSurface,
      useClass: SurfaceCostService,
    },
  ],
  exports: [ShapefileService, ExtractSurfaceCostFromShapefile],
})
export class ShapefilesModule {}
