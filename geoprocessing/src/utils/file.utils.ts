/**
 * File Utils
 */

import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { createReadStream, readdirSync } from 'fs';

//import mapshaper from 'mapshaper';

/**
 * ES5 import to avoid TS complaining
 */
const multer = require('multer');
const unzipper = require('unzipper');
const mapshaper = require('mapshaper');
const path = require('path');
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
