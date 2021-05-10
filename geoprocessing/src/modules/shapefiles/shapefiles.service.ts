import { Injectable, Logger } from '@nestjs/common';

import { createReadStream, rmdirSync, unlinkSync } from 'fs';
const mapshaper = require('mapshaper');
const unzipper = require('unzipper');

@Injectable()
export class ShapeFileService {
  private readonly logger: Logger = new Logger(ShapeFileService.name);
  constructor() {}

  private unzipShapefile(fileInfo: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      createReadStream(fileInfo.path)
        .pipe(
          unzipper.Extract({
            path: `${fileInfo.destination}/${fileInfo.filename.replace(
              '.zip',
              '',
            )}`,
          }),
        )
        .on('close', () =>
          resolve(`${fileInfo.filename} extracted succesfully`),
        )
        .on('error', (error: Error) =>
          reject(
            new Error(
              `${fileInfo.filename} could not been extracted: ` + error,
            ),
          ),
        );
    });
  }

  private async shapeFileToGeoJson(fileInfo: Express.Multer.File) {
    const outputKey = `shapefile-${new Date().getTime()}.geojson`;

    const _geoJson = await mapshaper.applyCommands(
      `-i ${fileInfo.path.replace(
        '.zip',
        '',
      )}/*.shp -info -o ${outputKey} -verbose `,
    );

    return JSON.parse(_geoJson[outputKey].toString('utf-8'));
  }

  private deleteShapefileData(path: string): void {
    if (path.startsWith('/tmp')) {
      unlinkSync(path);
      rmdirSync(path.replace('.zip', ''), { recursive: true });
    } else {
      throw new Error(`Could not complete deletion: ${path} is not in /tmp`);
    }
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
