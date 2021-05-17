import { Injectable, Logger } from '@nestjs/common';

import { FileService } from '../../utils/file.utils';

const mapshaper = require('mapshaper');

@Injectable()
export class ShapefileService {
  constructor(
    private readonly logger: Logger,
    private fileService: FileService,
  ) {
    this.logger.setContext(ShapefileService.name);
    this.fileService = new FileService();
  }

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
    const geoJson = await this.shapeFileToGeoJson(shapeFile).then((geoJson) => {
      this.fileService.deleteDataFromFS(shapeFile.path);
      return geoJson;
    });
    return { data: geoJson };
  }
}
