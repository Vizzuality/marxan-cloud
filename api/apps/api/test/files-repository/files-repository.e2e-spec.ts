import { createReadStream } from 'fs';
import { Readable } from 'stream';
import { isRight, Right } from 'fp-ts/Either';
import { Test } from '@nestjs/testing';

import { FixtureType } from '@marxan/utils/tests/fixture-type';
import {
  CloningFilesRepository,
  CloningFileSRepositoryModule,
  VolumeCloningFilesStorage,
} from '@marxan/cloning-files-repository';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

afterEach(async () => {
  await fixtures?.cleanup();
});

/**
 * Please note that bootstrapApplication overrides default implementation
 * with `/tmp/storage/` usage
 */
test(`adding a file`, async () => {
  const uri = await fixtures.GivenFileWasAdded();
  const file = await fixtures.WhenGettingFile(uri);
  await fixtures.ThenFileIsRetrieved(file);
});

const getFixtures = async () => {
  /**
   * overriding repository implementation happens while bootstrapping test app
   * to avoid communicating with potential storage provider
   */
  const app = await Test.createTestingModule({
    imports: [CloningFileSRepositoryModule],
  })
    .overrideProvider(CloningFilesRepository)
    .useClass(VolumeCloningFilesStorage)
    .compile();
  const sut = app.get(CloningFilesRepository);

  return {
    cleanup: async () => app.close(),
    GivenFileWasAdded: async () => {
      const result = await sut.save(
        createReadStream(__dirname + `/some-file.json`),
        '.json',
      );
      expect(isRight(result)).toBeTruthy();
      return (result as Right<string>).right;
    },
    WhenGettingFile: async (file: string): Promise<Readable> => {
      const result = await sut.get(file);
      expect(isRight(result)).toBeTruthy();
      return (result as Right<Readable>).right;
    },
    ThenFileIsRetrieved: async (stream: Readable) => {
      const rawContent = await streamToString(stream);
      expect(JSON.parse(rawContent).marxan.isCool).toBeTruthy();
    },
  };
};

const streamToString = (stream: Readable): Promise<string> => {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
};
