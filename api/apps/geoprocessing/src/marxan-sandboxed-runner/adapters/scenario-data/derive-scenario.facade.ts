import { resolve, dirname } from 'path';
import { createWriteStream, promises } from 'fs';
import { HttpService, Injectable } from '@nestjs/common';
import { Assets, InputFiles } from '../../ports/input-files';

@Injectable()
export class DeriveScenarioFacade implements InputFiles {
  constructor(private readonly httpService: HttpService) {}

  async include(directory: string, assets: Assets): Promise<void> {
    // TODO security: ensure that none of the target filename starts with either `/` or `.` (tree traversing)
    await Promise.all(
      assets.map((asset) =>
        this.download(asset.url, resolve(directory, asset.relativeDestination)),
      ),
    );
    return;
  }

  private async download(sourceUri: string, dest: string) {
    await this.ensureWriteDirectoryExists(dest);
    return new Promise((resolve, reject) => {
      const writer = createWriteStream(dest);
      writer.on('finish', resolve);
      writer.on('error', reject);
      // "stream" seems to be broken, does not return stream but data itself
      // https://github.com/nestjs/nest/issues/4144 - not really working
      this.httpService
        .get(sourceUri, {
          responseType: 'stream',
        })
        .toPromise()
        .then((response) => {
          writer.write(response.data);
          writer.end();
        })
        .catch(reject);
    });
  }

  private async ensureWriteDirectoryExists(
    fileDestination: string,
  ): Promise<void> {
    // if directory does not exists, it will silently "success" downloading the file while it won't be there
    const desiredDirectory = dirname(fileDestination);
    await promises.mkdir(desiredDirectory, { recursive: true });
  }
}
