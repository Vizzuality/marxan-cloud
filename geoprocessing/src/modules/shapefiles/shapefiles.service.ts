import { Injectable, Logger } from '@nestjs/common';

import multer from 'multer';
import unzipper from 'unzipper';
import path from 'path';
import { createReadStream, readdirSync } from 'fs';
const mapshaper = require('mapshaper');

@Injectable()
export class ShapeFileService {
  private readonly logger: Logger = new Logger(ShapeFileService.name);
  constructor() {}

  private async _unzipShapefile(path: string) {
    return await createReadStream(path).pipe(
      unzipper.Extract({ path: '/../tmp/' + path.replace('.zip', '') }),
    );
  }

  private async shapeFileToGeoJson(path: string) {}
  getGeoJson(shapeFile: any) {
    this.logger.log('SHAPEFILE SERVICE ');
    console.log('SHAPEFILE FILE INFO', shapeFile);
    return { message: 'SHAPEFILE SERVICE RESPONSE' };
  }
}
