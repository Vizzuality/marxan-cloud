import { Injectable, Logger } from '@nestjs/common';

import multer from 'multer';

import { createReadStream, readdirSync } from 'fs';
const mapshaper = require('mapshaper');
const unzipper = require('unzipper');
const path = require('path');

@Injectable()
export class ShapeFileService {
  private readonly logger: Logger = new Logger(ShapeFileService.name);
  constructor() {}

  private async _unzipShapefile(fileInfo: Express.Multer.File): Promise<void> {
    this.logger.log(fileInfo.filename);
    await createReadStream(fileInfo.path)
      .pipe(
        unzipper.Extract({
          path: fileInfo.destination + fileInfo.filename.replace('.zip', ''),
        }),
      )
      .on('close', async function () {
        console.log(
          'FILE READ RESULT',
          readdirSync(
            path.join(
              __dirname,
              '..',
              '..',
              '..',
              '..',
              '..',
              'tmp',
              `${fileInfo.filename.replace('.zip', '')}`,
            ),
          ),
        );
        await mapshaper.applyCommands(
          `-i ${fileInfo.path.replace(
            '.zip',
            '',
          )}/POLYGON.shp -o format=geojson output.geojson`,

          (err: any, output: any) => console.log(output),
        );
        console.log('COMMAND RUN');
      });
  }

  private async _shapeFileToGeoJson(fileInfo: Express.Multer.File) {
    this.logger.log(fileInfo.path);
    this.logger.log(
      readdirSync(
        path.join(
          __dirname,
          '..',
          '..',
          '..',
          '..',
          '..',
          'tmp',
          `${fileInfo.filename.replace('.zip', '')}/layers`,
        ),
      ),
    );

    const _geoJson = await mapshaper.applyCommands(
      `-i ${fileInfo.path.replace(
        '.zip',
        '',
      )}/layers/POLYGON.shp -o format=geojson`,
    );
    this.logger.log(_geoJson);
  }

  async getGeoJson(shapeFile: any) {
    this.logger.log('SHAPEFILE SERVICE ');
    const res = await this._unzipShapefile(shapeFile);
    //this._shapeFileToGeoJson(shapeFile);

    return { message: 'SHAPEFILE SERVICE RESPONSE' };
  }
}
