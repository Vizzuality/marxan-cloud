import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

import { AppConfig } from './config.utils';

import * as multer from 'multer';

import { v4 as uuidv4 } from 'uuid';

/**
 * Options for Multer
 */
export const uploadOptions: MulterOptions = {
  storage: multer.diskStorage({
    filename: (
      _req: any,
      file: Express.Multer.File,
      cb: (error: Error | null, filename: string) => void,
    ) => {
      cb(null, `${uuidv4()}_${file.originalname}`);
    },
  }),
  limits: {
    /**
     * If the environment variable FILE_UPLOADS_SIZE_LIMIT_MEBIBYTES is set,
     * use this as fileSize limit, otherwise fall back to hardcoded default
     * (50MiB).
     */
    fileSize: (() => {
      const fileUploadsSizeLimitMebibytes = AppConfig.get<number>(
        'fileUploads.limits.fileSize',
        50 * 1024e2,
      );
      return fileUploadsSizeLimitMebibytes;
    })(),
  },
};
