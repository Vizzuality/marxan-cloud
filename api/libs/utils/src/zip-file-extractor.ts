import { Either, left, right } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import * as unzipper from 'unzipper';

export const extractFileFailed = Symbol('Extract file failed');

export async function extractFile(
  readable: Readable,
  fileRelativePath: string,
): Promise<Either<typeof extractFileFailed, string>> {
  return new Promise<Either<typeof extractFileFailed, string>>((resolve) => {
    readable
      .pipe(unzipper.ParseOne(new RegExp(fileRelativePath)))
      .on('entry', async (entry: unzipper.Entry) => {
        const buffer = await entry.buffer();
        resolve(right(buffer.toString()));
      })
      .on('error', () => {
        resolve(left(extractFileFailed));
      });
  });
}
