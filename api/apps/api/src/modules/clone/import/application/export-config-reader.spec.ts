import { ClonePiece, ResourceKind } from '@marxan/cloning/domain';
import { ClonePieceRelativePathResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import {
  ExportConfigContent,
  exportVersion,
} from '@marxan/cloning/infrastructure/clone-piece-data/export-config';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Test } from '@nestjs/testing';
import * as archiver from 'archiver';
import { Either, isLeft, isRight, Left, Right } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { v4 } from 'uuid';
import {
  ExportConfigReader,
  ExportConfigReaderError,
  invalidExportConfigFile,
  zipFileDoesNotContainsExportConfig,
} from './export-config-reader';

let fixtures: FixtureType<typeof getFixtures>;

describe('ExportConfigReader', () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  it('should fail when zip file does not contain export config file', async () => {
    const zipFile = await fixtures.GivenArchiveMissingExportConfig();
    const result = await fixtures.WhenReadingExportConfig(zipFile);
    fixtures.ThenZipFileDoesNotContainExportConfigErrorShouldBeReturned(result);
  });

  it('should fail when resource kind property of export config file has an invalid value', async () => {
    const invalidExportConfig: ExportConfigContent = {
      resourceKind: 'invalid resource kind' as ResourceKind,
      name: 'name',
      pieces: [ClonePiece.ExportConfig],
      projectId: v4(),
      resourceId: v4(),
      scenarios: [],
      version: '1.0.0',
      description: 'description',
      isCloning: false,
      exportId: v4(),
    };
    const zipFile = await fixtures.GivenArchiveWithInvalidExportConfig(
      invalidExportConfig,
    );
    const result = await fixtures.WhenReadingExportConfig(zipFile);
    fixtures.ThenInvalidExportConfigFileErrorShouldBeReturned(result);
  });

  it('should fail when pieces property of project export config file has an invalid value', async () => {
    const invalidExportConfig: ExportConfigContent = {
      resourceKind: ResourceKind.Project,
      name: 'name',
      pieces: {
        project: [ClonePiece.ExportConfig, ClonePiece.ProjectMetadata],
        scenarios: {
          'non-uuid-key': [ClonePiece.ScenarioMetadata],
        },
      },
      projectId: v4(),
      resourceId: v4(),
      scenarios: [],
      version: '1.0.0',
      description: 'description',
      isCloning: false,
      exportId: v4(),
    };
    const zipFile = await fixtures.GivenArchiveWithInvalidExportConfig(
      invalidExportConfig,
    );
    const result = await fixtures.WhenReadingExportConfig(zipFile);
    fixtures.ThenInvalidExportConfigFileErrorShouldBeReturned(result);
  });

  it('should fail when pieces property of scenario export config file has an invalid value', async () => {
    const invalidExportConfig: ExportConfigContent = {
      resourceKind: ResourceKind.Scenario,
      name: 'name',
      pieces: ['invalid-piece' as ClonePiece],
      projectId: v4(),
      resourceId: v4(),
      scenarios: [],
      version: '1.0.0',
      description: 'description',
      isCloning: false,
      exportId: v4(),
    };
    const zipFile = await fixtures.GivenArchiveWithInvalidExportConfig(
      invalidExportConfig,
    );
    const result = await fixtures.WhenReadingExportConfig(zipFile);
    fixtures.ThenInvalidExportConfigFileErrorShouldBeReturned(result);
  });

  it('should fail when version property of export config file has an invalid value', async () => {
    const zipFile = await fixtures.GivenArchiveWithInvalidExportConfigVersion();
    const result = await fixtures.WhenReadingExportConfig(zipFile);
    fixtures.ThenInvalidExportConfigFileErrorShouldBeReturned(result);
  });

  it('should retrieve export config content', async () => {
    const zipFile = await fixtures.GivenValidArchive();
    const result = await fixtures.WhenReadingExportConfig(zipFile);
    fixtures.ThenExportConfigShouldBeReturned(result);
  });
});

const getFixtures = async () => {
  const sandbox = await Test.createTestingModule({
    imports: [],
    providers: [ExportConfigReader],
  }).compile();
  await sandbox.init();

  const scenarioId = v4();
  const expectedExportConfig: ExportConfigContent = {
    description: 'random description',
    name: 'random name',
    pieces: {
      project: [ClonePiece.ExportConfig, ClonePiece.ScenarioMetadata],
      scenarios: {
        [scenarioId]: [ClonePiece.ScenarioMetadata],
      },
    },
    projectId: v4(),
    resourceId: v4(),
    exportId: v4(),
    resourceKind: ResourceKind.Project,
    scenarios: [{ id: v4(), name: 'random scenario' }],
    version: exportVersion,
    isCloning: false,
  };

  const sut = sandbox.get(ExportConfigReader);
  return {
    GivenArchiveMissingExportConfig: async (): Promise<Readable> => {
      const archive = archiver(`zip`, {
        zlib: { level: 9 },
      });

      archive.append('foo bar', {
        name: 'foo.txt',
      });

      await archive.finalize();

      return archive;
    },
    GivenArchiveWithInvalidExportConfig: async (
      invalidExportConfig: ExportConfigContent,
    ): Promise<Readable> => {
      const archive = archiver(`zip`, {
        zlib: { level: 9 },
      });

      const relativePath = ClonePieceRelativePathResolver.resolveFor(
        ClonePiece.ExportConfig,
      );

      archive.append(JSON.stringify(invalidExportConfig), {
        name: relativePath,
      });

      await archive.finalize();

      return archive;
    },
    GivenArchiveWithInvalidExportConfigVersion: async (): Promise<Readable> => {
      const archive = archiver(`zip`, {
        zlib: { level: 9 },
      });
      const invalidExportConfig = expectedExportConfig;
      invalidExportConfig.version = '';

      const relativePath = ClonePieceRelativePathResolver.resolveFor(
        ClonePiece.ExportConfig,
      );

      archive.append(JSON.stringify(invalidExportConfig), {
        name: relativePath,
      });

      await archive.finalize();

      return archive;
    },
    GivenValidArchive: async (): Promise<Readable> => {
      const archive = archiver(`zip`, {
        zlib: { level: 9 },
      });
      const relativePath = ClonePieceRelativePathResolver.resolveFor(
        ClonePiece.ExportConfig,
      );

      archive.append(JSON.stringify(expectedExportConfig), {
        name: relativePath,
      });

      await archive.finalize();

      return archive;
    },
    WhenReadingExportConfig: async (zipFile: Readable) => sut.read(zipFile),
    ThenZipFileDoesNotContainExportConfigErrorShouldBeReturned: (
      result: Either<ExportConfigReaderError, ExportConfigContent>,
    ) => {
      expect(isLeft(result)).toBeTruthy();
      expect((result as Left<ExportConfigReaderError>).left).toBe(
        zipFileDoesNotContainsExportConfig,
      );
    },
    ThenInvalidExportConfigFileErrorShouldBeReturned: (
      result: Either<ExportConfigReaderError, ExportConfigContent>,
    ) => {
      expect(isLeft(result)).toBeTruthy();
      expect((result as Left<ExportConfigReaderError>).left).toBe(
        invalidExportConfigFile,
      );
    },
    ThenExportConfigShouldBeReturned: (
      result: Either<ExportConfigReaderError, ExportConfigContent>,
    ) => {
      expect(isRight(result)).toBeTruthy();
      expect((result as Right<ExportConfigContent>).right).toEqual(
        expectedExportConfig,
      );
    },
  };
};
