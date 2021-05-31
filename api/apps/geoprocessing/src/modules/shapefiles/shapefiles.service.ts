import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { FeatureCollection } from 'geojson';
import { FileService } from '../files/files.service';

const mapshaper = require('mapshaper');

const MIN_REQUIRED_FILES = ['prj', 'dbf', 'shx', 'shp'];
@Injectable()
export class ShapefileService {
  private readonly logger: Logger = new Logger(ShapefileService.name);
  constructor(private readonly fileService: FileService) {}

  private async shapeFileToGeoJson(fileInfo: Express.Multer.File) {
    if (
      !(await this.fileService.areFilesInFolder(
        fileInfo.path.replace('.zip', ''),
        MIN_REQUIRED_FILES,
      ))
    ) {
      throw new Error('Some required file mising');
    }
    console.log('works');
    const outputKey = `shapefile-${new Date().getTime()}.geojson`;

    const _geoJson = await mapshaper.applyCommands(
      `-i no-topology snap ${fileInfo.path.replace(
        '.zip',
        '',
      )}/*.shp -proj EPSG:4326 -clean rewind -info -o ${outputKey}`,
    );

    return JSON.parse(_geoJson[outputKey].toString('utf-8'));
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
