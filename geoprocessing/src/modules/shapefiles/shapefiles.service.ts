import { Injectable, Logger } from '@nestjs/common';

import { createReadStream, rmdirSync, readFileSync, unlinkSync } from 'fs';
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
      `-i ${fileInfo.path.replace(
        '.zip',
        '',
      )}/*.shp -info -o ${outputKey} -verbose `,
    );

    return JSON.parse(_geoJson[outputKey].toString('utf-8'));
  }

  private wipeOutShapefile(path: string): void {
    unlinkSync(path);
    rmdirSync(path.replace('.zip', ''), { recursive: true });
  }

  async getGeoJson(shapeFile: Express.Multer.File) {
    try {
      this.logger.log(await this._unzipShapefile(shapeFile));
    } catch (err) {
      this.logger.error(err);
    }
    const geoJson = await this._shapeFileToGeoJson(shapeFile).then(
      (geoJson) => {
        this.wipeOutShapefile(shapeFile.path);
        return geoJson;
      },
    );
    return { data: geoJson };
  }
}
