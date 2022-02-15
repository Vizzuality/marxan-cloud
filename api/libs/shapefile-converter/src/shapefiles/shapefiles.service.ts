import { Injectable, Logger } from '@nestjs/common';
import { readdir, readFile, unlink } from 'fs/promises';
import { GeoJSON } from 'geojson';
import { FileService } from '../files/files.service';
import * as path from 'path';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mapshaper = require('mapshaper');

@Injectable()
export class ShapefileService {
  private readonly logger: Logger = new Logger(ShapefileService.name);
  private readonly minRequiredFiles = ['.prj', '.dbf', '.shx', '.shp'];

  constructor(private readonly fileService: FileService) {}

  private async shapeFileToGeoJson(
    fileInfo: Pick<Express.Multer.File, 'path' | 'filename' | 'destination'>,
  ) {
    if (
      !(await this.areRequiredShapefileFilesInFolder(
        fileInfo.path.replace('.zip', ''),
      ))
    ) {
      throw new Error(
        'Shapefile data is not usable: one or more required files are missing.',
      );
    }
    const baseDirectory = fileInfo.path.replace(/\.zip$/, '');
    const outputFile = path.join(
      baseDirectory,
      `shapefile-${new Date().getTime()}.geojson`,
    );

    await mapshaper.runCommandsXL(
      `-i snap "${fileInfo.path.replace(
        '.zip',
        '',
      )}/*.shp" -proj EPSG:4326 -clean rewind -info -o "${outputFile}"`,
    );

    const geoJsonBuffer = await readFile(outputFile);
    await unlink(outputFile);

    return JSON.parse(geoJsonBuffer.toString('utf-8'));
  }

  async areRequiredShapefileFilesInFolder(filePath: string): Promise<boolean> {
    const filesInPath = await readdir(filePath);
    const extensions = filesInPath.map((file) => path.extname(file)).map(ext => ext.toLocaleLowerCase());
    return this.minRequiredFiles.every((ext: string) =>
      extensions.includes(ext),
    );
  }

  isGeoJsonTypeSupported(geoJson: GeoJSON): boolean {
    return !(
      geoJson.type !== 'FeatureCollection' ||
      geoJson.features.every(
        (geom: any) =>
          geom.geometry?.type !== 'Polygon' &&
          geom.geometry?.type !== 'MultiPolygon',
      )
    );
  }

  /**
   * converts file to a geojson and *removes* it
   */
  async transformToGeoJson(
    shapeFile: Pick<Express.Multer.File, 'path' | 'filename' | 'destination'>,
  ): Promise<{
    data: GeoJSON;
  }> {
    try {
      this.logger.log(
        await this.fileService.unzipFile(
          shapeFile.path,
          shapeFile.filename,
          shapeFile.destination,
        ),
      );
      const geoJson = await this.shapeFileToGeoJson(shapeFile);
      if (!this.isGeoJsonTypeSupported(geoJson)) {
        throw new Error('Types not supported');
      }
      return { data: geoJson };
    } catch (err) {
      this.logger.error(err);
      throw new Error(`Invalid Shapefile: ${err}`);
    } finally {
      await this.fileService
        .deleteDataFromFS(shapeFile.path)
        .catch((error) => this.logger.error(error));
    }
  }
}
