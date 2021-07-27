import { Readable } from 'stronger-typed-streams';

export const streamToArray = <T>(stream: Readable<T>): Promise<T[]> =>
  new Promise((resolve, reject) => {
    const chunks: T[] = [];
    stream.on(`error`, reject);
    stream.on(`data`, (chunk) => {
      chunks.push(chunk);
    });
    stream.on(`end`, () => resolve(chunks));
  });
