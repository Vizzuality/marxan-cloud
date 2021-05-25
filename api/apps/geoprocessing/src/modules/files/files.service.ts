import { Injectable } from '@nestjs/common';
import { createReadStream } from 'fs';
import { Extract } from 'unzipper';
import * as path from 'path';
import { unlink, rmdir } from 'fs/promises';

@Injectable()
export class FileService {
  unzipFile(fileInfo: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const stream = createReadStream(fileInfo.path);
      stream.on('close', () =>
        resolve(`${fileInfo.filename} extracted successfully`),
      );
      stream.on('error', (error: Error) =>
        reject(
          new Error(`${fileInfo.filename} could not be extracted: ` + error),
        ),
      );

      stream.pipe(
        Extract({
          path: path.join(
            fileInfo.destination,
            path.basename(fileInfo.filename.replace('.zip', '')),
          ),
        }),
      );
    });
  }

  async deleteDataFromFS(path: string): Promise<void> {
    if (path.startsWith('/tmp')) {
      await unlink(path);
      await rmdir(path.replace('.zip', ''), { recursive: true });
    } else {
      throw new Error(`Could not complete deletion: ${path} is not in /tmp`);
    }
  }
}
