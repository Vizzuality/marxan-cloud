/**
 * File Utils
 */

import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { createReadStream, mkdirSync } from 'fs';
import mapshaper from 'mapshaper';

/**
 * ES5 import to avoid TS complaining
 */
const multer = require('multer');
const unzipper = require('unzipper');

/**
 * Options for Multer
 */
export const uploadOptions: MulterOptions = {
  storage: multer.diskStorage({
    destination: function (
      req: any,
      file: any,
      cb: (error: Error | null, destination: string) => void,
    ) {
      cb(null, '/../tmp/');
    },
    filename: function (
      req: any,
      file: any,
      cb: (error: Error | null, fieldname: string) => void,
    ) {
      cb(null, Date.now() + '-' + file.originalname);
    },
  }),
};

export const unzipShapefile = async (path: string) => {
  //mkdirSync(path.replace('.zip', ''));
  console.log('*********** PATH ***********', path);
  console.log(
    '*********** REPLACED PATH **********',
    path.replace('.zip', '.'),
  );
  await createReadStream(path).pipe(
    unzipper.Extract({ path: '/../tmp/' + path.replace('.zip', '') }),
  );
};

export const shapeFileToGeoJson = (shapefile: any) => {
  const geoJson = mapshaper.runCommand();
};
