import { SharedStorage, SharedStoragePath } from './shared-storage';
import { Test } from '@nestjs/testing';
import { MarxanDirectory } from '../../adapters-single/marxan-directory.service';
import { v4 } from 'uuid';

let sut: SharedStorage;
const randomSubdirectory = v4();

beforeEach(async () => {
  const sandbox = await Test.createTestingModule({
    providers: [
      SharedStorage,
      {
        provide: MarxanDirectory,
        useValue: {},
      },
      {
        provide: SharedStoragePath,
        useValue: `/tmp/${randomSubdirectory}`,
      },
    ],
  }).compile();

  sut = sandbox.get(SharedStorage);
});

describe(`when trying to reach disallowed directory`, () => {
  it(`should throw`, async () => {
    await expect(sut.cleanup('../../etc/passwd')).rejects.toMatchInlineSnapshot(
      `[Error: Directory traversal is not allowed.]`,
    );
  });
});

describe(`when contains null byte`, () => {
  it(`should throw`, async () => {
    await expect(
      sut.cleanup('random-subdir/\0cat /etc/passwd'),
    ).rejects.toMatchInlineSnapshot(`[Error: Hacking is not allowed.]`);
  });
});
