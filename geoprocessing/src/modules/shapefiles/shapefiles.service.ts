import { Injectable, Logger } from '@nestjs/common';

import { createReadStream, rmdirSync } from 'fs';
const mapshaper = require('mapshaper');
const unzipper = require('unzipper');

@Injectable()
export class ShapeFileService {
  private readonly logger: Logger = new Logger(ShapeFileService.name);
  constructor() {}

  private _unzipShapefile(fileInfo: Express.Multer.File): Promise<String> {
    return new Promise((resolve, reject) => {
      createReadStream(fileInfo.path)
        .pipe(
          unzipper.Extract({
            path: fileInfo.destination + fileInfo.filename.replace('.zip', ''),
          }),
        )
        .on('close', () =>
          resolve(`${fileInfo.filename} extracted succesfully`),
        )
        .on('error', () =>
          reject(new Error(`${fileInfo.filename} could not been extracted`)),
        );
    });
  }

  private async _shapeFileToGeoJson(fileInfo: Express.Multer.File) {
    const _geoJson = await mapshaper.applyCommands(
      `-i ${fileInfo.path.replace('.zip', '')}/*.shp -o format=geojson`,
    );
    this.logger.log(_geoJson);

    return _geoJson;
  }

  private wipeOutFolder(path: string): void {
    rmdirSync(path, { recursive: true });
  }

  async getGeoJson(shapeFile: any) {
    const res = await this._unzipShapefile(shapeFile);
    this.logger.log(res);
    const geoJson = await this._shapeFileToGeoJson(shapeFile).then(() => {
      this.wipeOutFolder(shapeFile.path.replace('.zip', ''));
    });

    return { message: 'SHAPEFILE SERVICE RESPONSE', data: geoJson };
  }
}
