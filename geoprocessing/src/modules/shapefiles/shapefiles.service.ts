import { Injectable, Logger } from '@nestjs/common';
import { FileService } from '../files/files.service';
const mapshaper = require('mapshaper');

@Injectable()
export class ShapefileService {
  private readonly logger: Logger = new Logger(ShapefileService.name);
  constructor(private readonly fileService: FileService) {}

  private async shapeFileToGeoJson(fileInfo: Express.Multer.File) {
    const outputKey = `shapefile-${new Date().getTime()}.geojson`;

    const _geoJson = await mapshaper.applyCommands(
      `-i ${fileInfo.path.replace('.zip', '')}/*.shp -info -o ${outputKey}`,
    );

    return JSON.parse(_geoJson[outputKey].toString('utf-8'));
  }

  async getGeoJson(shapeFile: Express.Multer.File) {
    try {
      this.logger.log(await this.fileService.unzipFile(shapeFile));
    } catch (err) {
      this.logger.error(err);
    }
    const geoJson = await this.shapeFileToGeoJson(shapeFile);
    await this.fileService
      .deleteDataFromFS(shapeFile.path)
      .catch((error) => this.logger.error(error));

    return { data: geoJson };
  }
}
