import { Either, left, right } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { Parse } from 'unzipper';

export const extractFileFailed = Symbol('Extract file failed');
export const fileNotFound = Symbol('File not found');

export async function extractFile(
  readable: Readable,
  fileRelativePath: string,
): Promise<Either<typeof extractFileFailed | typeof fileNotFound, string>> {
  return new Promise<
    Either<typeof extractFileFailed | typeof fileNotFound, string>
  >(async (resolve) => {
    const zip = readable.pipe(Parse({ forceStream: true })).on('error', () => {
      resolve(left(extractFileFailed));
    });

    for await (const entry of zip) {
      if (entry.path !== fileRelativePath) {
        entry.autodrain();
        continue;
      }
      const buffer = await entry.buffer();
      resolve(right(buffer.toString()));
    }

    resolve(left(fileNotFound));
  });
}

export async function extractFiles(
  readable: Readable,
  filesRelativePaths: string[],
): Promise<Either<typeof extractFileFailed, Record<string, Buffer>>> {
  return new Promise<Either<typeof extractFileFailed, Record<string, Buffer>>>(
    async (resolve) => {
      const zip = readable
        .pipe(Parse({ forceStream: true }))
        .on('error', () => {
          resolve(left(extractFileFailed));
        });

      const buffers: Record<string, Buffer> = {};

      for await (const entry of zip) {
        if (!filesRelativePaths.includes(entry.path)) {
          entry.autodrain();
          continue;
        }
        const buffer = await entry.buffer();

        buffers[entry.path] = buffer;
      }

      resolve(right(buffers));
    },
  );
}
