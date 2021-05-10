import { Injectable, Logger } from '@nestjs/common';

import { createReadStream, rmdirSync } from 'fs';
const mapshaper = require('mapshaper');
const unzipper = require('unzipper');

@Injectable()
export class ShapeFileService {
  private readonly logger: Logger = new Logger(ShapeFileService.name);
  constructor() {}

  private _unzipShapefile(fileInfo: Express.Multer.File): Promise<string> {
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
    const outputKey = `shapefile-${new Date().getTime()}.gejson`;
    const _geoJson = await mapshaper.applyCommands(
      `-i ${fileInfo.path.replace('.zip', '')}/*.shp -o ${outputKey}`,
    );

    return JSON.parse(_geoJson[outputKey].toString('utf-8'));
  }

  private wipeOutFolder(path: string): void {
    rmdirSync(path, { recursive: true });
  }

  async getGeoJson(shapeFile: any) {
    const res = await this._unzipShapefile(shapeFile);
    this.logger.log(res);
    const geoJson = await this._shapeFileToGeoJson(shapeFile).then(
      (geoJson) => {
        this.wipeOutFolder(shapeFile.path.replace('.zip', ''));
        return geoJson;
      },
    );
    this.logger.log(geoJson);

    return { message: 'SHAPEFILE SERVICE RESPONSE', data: geoJson };
  }
}
