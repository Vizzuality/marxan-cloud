import { Injectable } from '@nestjs/common';
import { createReadStream } from 'fs';
import { Extract } from 'unzipper';
import * as path from 'path';
import { unlink, rmdir, readdir } from 'fs/promises';

@Injectable()
export class FileService {
  unzipFile(
    origin: string,
    fileName: string,
    destination: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const stream = createReadStream(origin);
      stream.on('error', (error: Error) =>
        reject(new Error(`${fileName} could not be extracted: ` + error)),
      );

      stream
        .pipe(
          Extract({
            path: path.join(destination, path.basename(fileName, '.zip')),
          }),
        )
        .on('error', (error: Error) =>
          reject(new Error(`${fileName} could not be extracted: ` + error)),
        )
        .on('close', () => resolve(`${fileName} extracted successfully`));
    });
  }

<<<<<<< HEAD:api/apps/geoprocessing/src/modules/files/files.service.ts
=======
  async areFilesInFolder(
    path: string,
    fileExtensions: Array<string>,
  ): Promise<boolean> {
    const filesInPath = await readdir(path);
    const extensions = filesInPath.map((file) => file.split('.').pop());
    return fileExtensions.every((ext: string) => extensions.includes(ext));
  }

>>>>>>> 1304e566 (Validate given extensions are present in given path):geoprocessing/src/modules/files/files.service.ts
  async deleteDataFromFS(path: string): Promise<void> {
    if (path.startsWith('/tmp')) {
      await unlink(path);
      await rmdir(path.replace('.zip', ''), { recursive: true });
    } else {
      throw new Error(`Could not complete deletion: ${path} is not in /tmp`);
    }
  }
}
