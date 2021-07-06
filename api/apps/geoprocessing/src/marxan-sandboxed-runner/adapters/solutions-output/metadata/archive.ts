import * as archiver from 'archiver';
import { createWriteStream } from 'fs';

export class Archive {
  constructor(
    private readonly sourceDirectory: string,
    public readonly targetArchivePath: string,
  ) {}

  async zip(): Promise<Archive> {
    const archive = archiver('zip', {
      zlib: { level: 9 },
    });
    const destinationStream = createWriteStream(this.targetArchivePath);
    return new Promise((resolve, reject) => {
      archive.on('finish', () => {
        resolve(this);
      });
      archive.on('error', function (err) {
        reject(err);
      });
      archive.pipe(destinationStream);
      archive.directory(this.sourceDirectory, false);
      archive.finalize();
    });
  }
}
