import { Injectable } from '@nestjs/common';
import { createReadStream } from 'fs';
import { Extract } from 'unzipper';
import * as path from 'path';
import { unlink, rmdir } from 'fs/promises';

@Injectable()
export class FileService {
  unzipFile(fileInfo: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      createReadStream(fileInfo.path)
        .pipe(
          Extract({
            path: path.join(
              fileInfo.destination,
              path.basename(fileInfo.filename.replace('.zip', '')),
            ),
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

<<<<<<< HEAD
  async deleteDataFromFS(path: string): Promise<void> {
    if (path.startsWith('/tmp')) {
      await unlink(path);
      await rmdir(path.replace('.zip', ''), { recursive: true });
=======
  deleteDataFromFS(path: string): void {
    if (path.startsWith('/tmp')) {
      unlink(path);
      rmdir(path.replace('.zip', ''), { recursive: true });
>>>>>>> 9d23a303 (Wrapp FileService in FileModule)
    } else {
      throw new Error(`Could not complete deletion: ${path} is not in /tmp`);
    }
  }
}
