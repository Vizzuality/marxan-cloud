import { FileReadersModule } from '@marxan-geoprocessing/legacy-project-import/legacy-piece-importers/file-readers/file-readers.module';
import { InputLegacyProjectPieceImporter } from '@marxan-geoprocessing/legacy-project-import/legacy-piece-importers/input.legacy-piece-importer';
import { GeoLegacyProjectImportFilesRepositoryModule } from '@marxan-geoprocessing/modules/legacy-project-import-files-repository';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import {
  LegacyProjectImportFilesRepository,
  LegacyProjectImportFileType,
  LegacyProjectImportJobInput,
  LegacyProjectImportPiece,
} from '@marxan/legacy-project-import';
import { MarxanParameters } from '@marxan/marxan-input';

import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getEntityManagerToken, TypeOrmModule } from '@nestjs/typeorm';
import { classToPlain } from 'class-transformer';
import { isLeft } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';
import {
  DeleteProjectAndOrganization,
  GivenScenarioExists,
} from '../cloning/fixtures';

let fixtures: FixtureType<typeof getFixtures>;

describe(InputLegacyProjectPieceImporter, () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  }, 10_000);

  afterEach(async () => {
    await fixtures?.cleanUp();
  });

  it('fails when input.dat is missing in files array', async () => {
    const job = fixtures.GivenJobInput({
      missingInputDatFile: true,
    });

    await fixtures
      .WhenPieceImporterIsInvoked(job)
      .ThenAInputDatFileNotFoundErrorShouldBeThrown();
  });

  it('fails when input.dat cannot be retrieved from files repo', async () => {
    const job = fixtures.GivenJobInput();

    await fixtures
      .WhenPieceImporterIsInvoked(job)
      .ThenAInputDatFileNotFoundInFilesRepoErrorShouldBeThrown();
  });

  it('fails when read operation on input.dat fails', async () => {
    const fileLocation = await fixtures.GivenInvalidInputDatFile();
    const job = fixtures.GivenJobInput({ fileLocation });

    await fixtures
      .WhenPieceImporterIsInvoked(job)
      .ThenAInputDatReadOperationErrorShouldBeThrown();
  });

  it('updates successfully scenario metadata', async () => {
    const fileLocation = await fixtures.GivenValidInputDatFile();
    const job = fixtures.GivenJobInput({ fileLocation });
    await fixtures.GivenProjectWithScenarioExist();

    await fixtures
      .WhenPieceImporterIsInvoked(job)
      .ThenScenarioMetadataDataShouldBeUpdated();
  });
});

const getFixtures = async () => {
  const sandbox = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        ...geoprocessingConnections.apiDB,
        keepConnectionAlive: true,
        logging: false,
      }),
      FileReadersModule,
      GeoLegacyProjectImportFilesRepositoryModule,
    ],
    providers: [
      InputLegacyProjectPieceImporter,
      { provide: Logger, useValue: { error: () => {}, setContext: () => {} } },
    ],
  }).compile();

  await sandbox.init();
  const projectId = v4();
  const scenarioId = v4();
  const organizationId = v4();

  const sut = sandbox.get(InputLegacyProjectPieceImporter);
  const filesRepo = sandbox.get(LegacyProjectImportFilesRepository);
  const apiEntityManager = sandbox.get<EntityManager>(
    getEntityManagerToken(geoprocessingConnections.apiDB),
  );

  const fileType = LegacyProjectImportFileType.InputDat;
  let expectedMetadata = classToPlain(new MarxanParameters());

  const saveFile = async (fileContent: string) => {
    const result = await filesRepo.saveFile(
      projectId,
      Readable.from(fileContent),
      fileType,
    );
    if (isLeft(result)) throw new Error('file cannot be stored in files repo');
    return result.right;
  };

  return {
    cleanUp: async () => {
      return DeleteProjectAndOrganization(
        apiEntityManager,
        projectId,
        organizationId,
      );
    },
    GivenJobInput: (
      {
        missingInputDatFile,
        fileLocation,
      }: {
        missingInputDatFile?: boolean;
        fileLocation?: string;
      } = { missingInputDatFile: false, fileLocation: 'foo/input.dat' },
    ): LegacyProjectImportJobInput => {
      return {
        piece: LegacyProjectImportPiece.Input,
        files: missingInputDatFile
          ? []
          : [
              {
                id: v4(),
                location: fileLocation ?? '',
                type: fileType,
              },
            ],
        pieceId: v4(),
        projectId,
        scenarioId,
      };
    },
    GivenProjectWithScenarioExist: async () =>
      GivenScenarioExists(
        apiEntityManager,
        scenarioId,
        projectId,
        organizationId,
      ),
    GivenValidInputDatFile: async () => {
      const validVariableValues = {
        BESTSCORE: 100,
        BLM: 200,
      };
      expectedMetadata = { ...expectedMetadata, ...validVariableValues };

      return saveFile('BESTSCORE 100/nBLM 200');
    },
    GivenInvalidInputDatFile: () => {
      const invalidVariableValues = 'BESTSCORE invalidBestScore';
      return saveFile(invalidVariableValues);
    },
    WhenPieceImporterIsInvoked: (input: LegacyProjectImportJobInput) => {
      return {
        ThenAInputDatFileNotFoundErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(
            /input.dat file was not found inside input file array/gi,
          );
        },
        ThenAInputDatFileNotFoundInFilesRepoErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(
            /input.dat file was not found in files repo/gi,
          );
        },
        ThenAInputDatReadOperationErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(
            /invalid variables values in input.dat file/gi,
          );
        },
        ThenScenarioMetadataDataShouldBeUpdated: async () => {
          const result = await sut.run(input);

          expect(result).toBeDefined();

          const [scenario]: {
            metadata: string;
          }[] = await apiEntityManager
            .createQueryBuilder()
            .select('metadata')
            .from('scenarios', 's')
            .where('id = :scenarioId', { scenarioId })
            .execute();

          expect(scenario.metadata).toEqual(expectedMetadata);
        },
      };
    },
  };
};
