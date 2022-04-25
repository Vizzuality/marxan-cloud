import { Readable } from 'stream';

export async function readableToBuffer(readable: Readable): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const buffer: Array<any> = [];

    readable.on('data', (chunk) => buffer.push(chunk));
    readable.on('end', () => resolve(Buffer.concat(buffer)));
    readable.on('error', (err) => reject(err));
  });
}
