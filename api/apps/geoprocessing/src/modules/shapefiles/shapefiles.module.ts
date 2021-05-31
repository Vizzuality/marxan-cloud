import { Module } from '@nestjs/common';
import { ShapefileService } from './shapefiles.service';
import { FilesModule } from '../files/files.module';

/**
 * Module purposes:
 *
 * - handle input shapefiles and convert them to GeoJson (ShapeFileService)
 *
 */
@Module({
  imports: [FilesModule],
  providers: [ShapefileService],
  exports: [ShapefileService],
})
export class ShapefilesModule {}
