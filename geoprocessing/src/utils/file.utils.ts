/**
 * File Utils
 */

import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { Request } from 'express';

/**
 * ES5 import to avoid TS complaining
 */
const multer = require('multer');

export const uploadOptions: MulterOptions = {
  storage: multer.diskStorage({
    destination: function (
      req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, destination: string) => void,
    ) {
      cb(null, '/../tmp/');
    },
    filename: function (
      req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, fieldname: string) => void,
    ) {
      cb(null, Date.now() + '-' + file.originalname);
    },
  }),
};
