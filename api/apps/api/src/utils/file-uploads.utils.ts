import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

import { AppConfig } from './config.utils';

import * as multer from 'multer';

import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as unzipper from 'unzipper';
import { BadRequestException } from '@nestjs/common';

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
    destination: AppConfig.get<string>('storage.sharedFileStorage.localPath'),
  }),
  limits: {
    /**
     * If the environment variable FILE_UPLOADS_SIZE_LIMIT_MEBIBYTES is set,
     * use this as fileSize limit, otherwise fall back to hardcoded default
     * (50MiB).
     */
    fileSize: (() =>
      AppConfig.get<number>('fileUploads.limits.fileSize', 50 * 1024e2))(),
  },
};

export const ensureShapefileHasRequiredFiles = async (
  file: Express.Multer.File,
) => {
  const extensionsToHave = ['shp', 'dbf', 'prj', 'shx'];
  const filesInsideZipFile: string[] = [];

  await fs
    .createReadStream(file.path)
    .pipe(unzipper.Parse())
    .on('entry', (entry) => {
      if (
        extensionsToHave.some(
          (extension) => extension === entry.path.split('.')[1],
        )
      ) {
        filesInsideZipFile.push(entry.path);
      }

      return entry.autodrain();
    })
    .promise();

  const extensionsInZipFile = filesInsideZipFile.map(
    (fileName) => fileName.split('.')[1],
  );

  const missingFileExtensions = extensionsToHave.filter(
    (ext) => !extensionsInZipFile.includes(ext),
  );

  const formattedMissingFileExtensions = missingFileExtensions.map(
    (ext) => `.${ext}`,
  );

  if (missingFileExtensions.length) {
    throw new BadRequestException(
      `Missing shapefile components: ${formattedMissingFileExtensions.reduce(
        (prev, current) => `${prev ? prev + ', ' : ''}${current}`,
        '',
      )}. All expected shapefile components must not be in folders within the archive`,
    );
  }
};
