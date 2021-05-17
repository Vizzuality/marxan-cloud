import { Injectable, Logger } from '@nestjs/common';

import { createReadStream, rmdirSync, unlinkSync } from 'fs';

const mapshaper = require('mapshaper');

@Injectable()
export class ShapeFileService {
  constructor(private readonly logger: Logger) {
    this.logger.setContext(ShapeFileService.name);
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
      this.logger.log(await this.unzipShapefile(shapeFile));
    } catch (err) {
      this.logger.error(err);
    }
    const geoJson = await this.shapeFileToGeoJson(shapeFile).then((geoJson) => {
      this.deleteShapefileData(shapeFile.path);
      return geoJson;
    });
    return { data: geoJson };
  }
}
