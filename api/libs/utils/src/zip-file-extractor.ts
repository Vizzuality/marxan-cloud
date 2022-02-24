import { Either, left, right } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { Parse, Entry } from 'unzipper';

export const extractFileFailed = Symbol('Extract file failed');

export async function extractFile(
  readable: Readable,
  fileRelativePath: string,
): Promise<Either<typeof extractFileFailed, string>> {
  return new Promise<Either<typeof extractFileFailed, string>>((resolve) => {
    readable
      .pipe(Parse())
      .on('entry', async (entry: Entry) => {
        if (entry.path !== fileRelativePath) {
          entry.autodrain();
          return;
        }

        const buffer = await entry.buffer();
        resolve(right(buffer.toString()));
      })
      .on('error', () => {
        resolve(left(extractFileFailed));
      });
  });
}
