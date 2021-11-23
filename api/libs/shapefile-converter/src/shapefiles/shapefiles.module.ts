import { Module } from '@nestjs/common';
import { ShapefileService } from './shapefiles.service';
import { FilesModule } from '../files/files.module';
import { ShapefileExtractorService } from './shapefile-extractor.service';

/**
 * Module purposes:
 *
 * - handle input shapefiles and convert them to GeoJson (ShapeFileService)
 *
 */
@Module({
  imports: [FilesModule],
  providers: [ShapefileService, ShapefileExtractorService],
  exports: [ShapefileService, ShapefileExtractorService],
})
export class ShapefilesModule {}
