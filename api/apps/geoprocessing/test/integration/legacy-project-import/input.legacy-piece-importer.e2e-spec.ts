import { FileReadersModule } from '@marxan-geoprocessing/legacy-project-import/legacy-piece-importers/file-readers/file-readers.module';
import { InputLegacyProjectPieceImporter } from '@marxan-geoprocessing/legacy-project-import/legacy-piece-importers/input.legacy-piece-importer';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import {
  LegacyProjectImportFilesMemoryRepository,
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

  it('updates successfully scenario metadata when job has solution files', async () => {
    const fileLocation = await fixtures.GivenValidInputDatFile();
    const job = fixtures.GivenJobInput({ fileLocation, withSolutions: true });
    await fixtures.GivenProjectWithScenarioExist();

    await fixtures
      .WhenPieceImporterIsInvoked(job)
      .ThenScenarioMetadataDataShouldBeUpdated({ withSolutions: true });
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
    ],
    providers: [
      InputLegacyProjectPieceImporter,
      {
        provide: LegacyProjectImportFilesRepository,
        useClass: LegacyProjectImportFilesMemoryRepository,
      },
      { provide: Logger, useValue: { error: () => {}, setContext: () => {} } },
    ],
  }).compile();

  await sandbox.init();
  const projectId = v4();
  const scenarioId = v4();
  const organizationId = v4();
  const ownerId = v4();

  const sut = sandbox.get(InputLegacyProjectPieceImporter);
  const filesRepo = sandbox.get(LegacyProjectImportFilesRepository);
  const apiEntityManager = sandbox.get<EntityManager>(
    getEntityManagerToken(geoprocessingConnections.apiDB),
  );

  const fileType = LegacyProjectImportFileType.InputDat;
  let expectedInputParameterFile = classToPlain(new MarxanParameters());

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
        withSolutions,
        fileLocation,
      }: {
        missingInputDatFile?: boolean;
        withSolutions?: boolean;
        fileLocation?: string;
      } = {
        missingInputDatFile: false,
        withSolutions: false,
        fileLocation: 'foo/input.dat',
      },
    ): LegacyProjectImportJobInput => {
      const files = [
        {
          id: v4(),
          location: fileLocation ?? '',
          type: fileType,
        },
      ];

      if (withSolutions)
        files.push({
          id: v4(),
          location: '',
          type: LegacyProjectImportFileType.Output,
        });

      return {
        piece: LegacyProjectImportPiece.Input,
        files: missingInputDatFile ? [] : files,
        pieceId: v4(),
        projectId,
        scenarioId,
        ownerId,
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
      expectedInputParameterFile = {
        ...expectedInputParameterFile,
        ...validVariableValues,
      };

      return saveFile('BESTSCORE 100\nBLM 200');
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
        ThenScenarioMetadataDataShouldBeUpdated: async (
          { withSolutions }: { withSolutions: boolean } = {
            withSolutions: false,
          },
        ) => {
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

          expect(scenario.metadata).toEqual({
            marxanInputParameterFile: expectedInputParameterFile,
            scenarioEditingMetadata: {
              tab: withSolutions ? 'solutions' : 'parameters',
              subtab: null,
              status: {
                'planning-unit': 'draft',
                features: 'draft',
                parameters: 'draft',
                solutions: withSolutions ? 'draft' : 'empty',
              },
              lastJobCheck: expect.any(Number),
            },
          });
        },
      };
    },
  };
};
