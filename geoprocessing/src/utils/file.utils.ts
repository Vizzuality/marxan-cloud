/**
 * File Utils
 */

import { Injectable } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { Request } from 'express';
import { diskStorage } from 'multer';
import * as tempDirectory from 'temp-dir';
import { createReadStream, rmdirSync, unlinkSync } from 'fs';
import { Extract } from 'unzipper';

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
      cb(null, new Date().getTime() + '-' + file.originalname);
    },
  }),
};

@Injectable()
export class FileSevice {
  unzipFile(fileInfo: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      createReadStream(fileInfo.path)
        .pipe(
          Extract({
            path: `${fileInfo.destination}/${fileInfo.filename.replace(
              '.zip',
              '',
            )}`,
          }),
        )
        .on('close', () =>
          resolve(`${fileInfo.filename} extracted successfully`),
        )
        .on('error', (error: Error) =>
          reject(
            new Error(`${fileInfo.filename} could not be extracted: ` + error),
          ),
        );
    });
  }

  private deleteDataFromFS(path: string): void {
    if (path.startsWith('/tmp')) {
      unlinkSync(path);
      rmdirSync(path.replace('.zip', ''), { recursive: true });
    } else {
      throw new Error(`Could not complete deletion: ${path} is not in /tmp`);
    }
  }
}
