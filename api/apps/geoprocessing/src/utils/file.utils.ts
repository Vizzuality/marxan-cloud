/**
 * File Utils
 */

import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { Request } from 'express';
import { diskStorage } from 'multer';
import * as tempDirectory from 'temp-dir';

export const uploadOptions: Readonly<MulterOptions> = {
  storage: diskStorage({
    destination: function (
      req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, destination: string) => void,
    ) {
      cb(null, tempDirectory);
    },
    filename: function (
      req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, fieldname: string) => void,
    ) {
      cb(
        null,
        `${new Date().getTime()}-${file.originalname}`.replace(/\s+/g, ''),
      );
    },
  }),
};
