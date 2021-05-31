import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { readdir } from 'fs/promises';
import { FeatureCollection } from 'geojson';
import { FileService } from '../files/files.service';

const mapshaper = require('mapshaper');

@Injectable()
export class ShapefileService {
  private readonly logger: Logger = new Logger(ShapefileService.name);
  private readonly minRequiredFiles = ['prj', 'dbf', 'shx', 'shp'];
  constructor(private readonly fileService: FileService) {}

  private async shapeFileToGeoJson(fileInfo: Express.Multer.File) {
    if (
      !(await this.areRequireShapefileFilesInFolder(
        fileInfo.path.replace('.zip', ''),
      ))
    ) {
      throw new Error(
        'Shapefile data is not usable: one or more required files are missing.',
      );
    }
    const outputKey = `shapefile-${new Date().getTime()}.geojson`;

    const _geoJson = await mapshaper.applyCommands(
      `-i no-topology snap ${fileInfo.path.replace(
        '.zip',
        '',
      )}/*.shp -proj EPSG:4326 -clean rewind -info -o ${outputKey}`,
    );

    return JSON.parse(_geoJson[outputKey].toString('utf-8'));
  }

  async areRequireShapefileFilesInFolder(path: string): Promise<boolean> {
    const filesInPath = await readdir(path);
    const extensions = filesInPath.map((file) => file.split('.').pop());
    return this.minRequiredFiles.every((ext: string) =>
      extensions.includes(ext),
    );
  }

  isValidGeoJson(geoJson: FeatureCollection): boolean {
    if (
      geoJson.type !== 'FeatureCollection' ||
      geoJson.features.every(
        (geom: any) =>
          geom.geometry.type !== 'Polygon' &&
          geom.geometry.type !== 'MultiPolygon',
      )
    )
      return false;
    return true;
  }

  async getGeoJson(shapeFile: Express.Multer.File) {
    try {
      this.logger.log(
        await this.fileService.unzipFile(
          shapeFile.path,
          shapeFile.filename,
          shapeFile.destination,
        ),
      );
      const geoJson = await this.shapeFileToGeoJson(shapeFile);
      if (!this.isValidGeoJson(geoJson)) {
        throw new Error();
      }
      return { data: geoJson };
    } catch (err) {
      this.logger.error(err);
      throw new BadRequestException('Invalid Shapefile');
    } finally {
      await this.fileService
        .deleteDataFromFS(shapeFile.path)
        .catch((error) => this.logger.error(error));
    }
  }
}
