import {
  ArchiveLocation,
  ClonePiece,
  ResourceKind,
} from '@marxan/cloning/domain';
import {
  archiveCorrupted,
  ArchiveReader,
  Failure,
  invalidFiles,
} from '@marxan/cloning/infrastructure/archive-reader.port';
import { ClonePieceRelativePaths } from '@marxan/cloning/infrastructure/clone-piece-data';
import { ExportConfigContent } from '@marxan/cloning/infrastructure/clone-piece-data/export-config';
import { fileNotFound } from '@marxan/files-repository/file.repository';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Test } from '@nestjs/testing';
import * as archiver from 'archiver';
import {
  Either,
  isLeft,
  isRight,
  left,
  Left,
  Right,
  right,
} from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { v4 } from 'uuid';
import { ExportConfigReader } from './export-config-reader';

let fixtures: FixtureType<typeof getFixtures>;

describe('ExportConfigReader', () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('should fail when cant find archive', async () => {
    const archiveLocation = fixtures.GivenNoArchive();
    const result = await fixtures.WhenReadingExportConfig(archiveLocation);
    fixtures.ThenNotFoundErrorShouldBeReturned(result);
  });
  test('should fail when export config file is missing', async () => {
    const archiveLocation = await fixtures.GivenArchiveMissingExportConfig();
    const result = await fixtures.WhenReadingExportConfig(archiveLocation);
    fixtures.ThenArchiveCorruptedErrorShouldBeReturned(result);
  });
  test('should fail when resource kind property of export config file has an invalid value', async () => {
    const archiveLocation = await fixtures.GivenArchiveWithInvalidExportConfig();
    const result = await fixtures.WhenReadingExportConfig(archiveLocation);
    fixtures.ThenInvalidFilesErrorShouldBeReturned(result);
  });
  test('should retrieve export config content', async () => {
    const archiveLocation = await fixtures.GivenValidArchive();
    const result = await fixtures.WhenReadingExportConfig(archiveLocation);
    fixtures.ThenExportConfigShouldBeReturned(result);
  });
});

const getFixtures = async () => {
  const archiveReaderGetMock = jest.fn();
  const sandbox = await Test.createTestingModule({
    imports: [],
    providers: [
      ExportConfigReader,
      { provide: ArchiveReader, useValue: { get: archiveReaderGetMock } },
    ],
  }).compile();
  await sandbox.init();

  const expectedExportConfig: ExportConfigContent = {
    description: 'random description',
    name: 'random name',
    pieces: [ClonePiece.ExportConfig, ClonePiece.ExportConfig],
    projectId: v4(),
    resourceId: v4(),
    resourceKind: ResourceKind.Project,
    scenarios: [{ id: v4(), name: 'random scenario' }],
    version: '',
  };

  const sut = sandbox.get(ExportConfigReader);
  return {
    GivenNoArchive: () => {
      archiveReaderGetMock.mockResolvedValue(left(fileNotFound));
      return new ArchiveLocation('not found');
    },
    GivenArchiveMissingExportConfig: (): Promise<ArchiveLocation> => {
      const archive = archiver(`zip`, {
        zlib: { level: 9 },
      });

      archive.append('foo bar', {
        name: 'foo.txt',
      });

      return new Promise((resolve, reject) => {
        const buffers: Buffer[] = [];
        archive.on('data', (chunk) => {
          buffers.push(chunk);
        });
        archive.on('finish', () => {
          archiveReaderGetMock.mockResolvedValue(
            right(Readable.from(Buffer.concat(buffers))),
          );
          resolve(new ArchiveLocation('invalid file'));
        });
        archive.on('error', function (err) {
          reject(err);
        });
        archive.finalize();
      });
    },
    GivenArchiveWithInvalidExportConfig: (): Promise<ArchiveLocation> => {
      const archive = archiver(`zip`, {
        zlib: { level: 9 },
      });
      const invalidExportConfig = { resourceKind: 'invalid resource kind' };
      archive.append(JSON.stringify(invalidExportConfig), {
        name: ClonePieceRelativePaths[ClonePiece.ExportConfig].config,
      });

      return new Promise((resolve, reject) => {
        const buffers: Buffer[] = [];
        archive.on('data', (chunk) => {
          buffers.push(chunk);
        });
        archive.on('finish', () => {
          archiveReaderGetMock.mockResolvedValue(
            right(Readable.from(Buffer.concat(buffers))),
          );
          resolve(new ArchiveLocation('invalid export config property'));
        });
        archive.on('error', function (err) {
          reject(err);
        });
        archive.finalize();
      });
    },
    GivenValidArchive: (): Promise<ArchiveLocation> => {
      const archive = archiver(`zip`, {
        zlib: { level: 9 },
      });
      archive.append(JSON.stringify(expectedExportConfig), {
        name: ClonePieceRelativePaths[ClonePiece.ExportConfig].config,
      });

      return new Promise((resolve, reject) => {
        const buffers: Buffer[] = [];
        archive.on('data', (chunk) => {
          buffers.push(chunk);
        });
        archive.on('finish', () => {
          archiveReaderGetMock.mockResolvedValue(
            right(Readable.from(Buffer.concat(buffers))),
          );
          resolve(new ArchiveLocation('valid export config'));
        });
        archive.on('error', function (err) {
          reject(err);
        });
        archive.finalize();
      });
    },
    WhenReadingExportConfig: async (archiveLocation: ArchiveLocation) =>
      sut.read(archiveLocation),
    ThenNotFoundErrorShouldBeReturned: (
      result: Either<Failure, ExportConfigContent>,
    ) => {
      expect(isLeft(result)).toBeTruthy();
      expect((result as Left<Failure>).left).toBe(fileNotFound);
    },
    ThenArchiveCorruptedErrorShouldBeReturned: (
      result: Either<Failure, ExportConfigContent>,
    ) => {
      expect(isLeft(result)).toBeTruthy();
      expect((result as Left<Failure>).left).toBe(archiveCorrupted);
    },
    ThenInvalidFilesErrorShouldBeReturned: (
      result: Either<Failure, ExportConfigContent>,
    ) => {
      expect(isLeft(result)).toBeTruthy();
      expect((result as Left<Failure>).left).toBe(invalidFiles);
    },
    ThenExportConfigShouldBeReturned: (
      result: Either<Failure, ExportConfigContent>,
    ) => {
      expect(isRight(result)).toBeTruthy();
      expect((result as Right<ExportConfigContent>).right).toStrictEqual(
        expectedExportConfig,
      );
    },
  };
};
