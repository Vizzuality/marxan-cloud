import { Readable } from 'stream';

export async function readableToBuffer(readable: Readable): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const buffer: Array<any> = [];

    readable.on('data', (chunk) => {
      if (typeof chunk === 'string') chunk = Buffer.from(chunk);
      if (!Buffer.isBuffer(chunk) && !(chunk instanceof Uint8Array)) {
        reject(
          new Error('Given chunk must be of type string, Buffer or Uint8Array'),
        );
        return;
      }
      buffer.push(chunk);
    });
    readable.on('end', () => resolve(Buffer.concat(buffer)));
    readable.on('error', (err) => reject(err));
  });
}
