import {
  DatFileDelimiterFinder,
  invalidDelimiter,
} from '@marxan-geoprocessing/legacy-project-import/legacy-piece-importers/file-readers/dat-file.delimiter-finder';
import { DatFileDelimiterFinderFake } from '@marxan-geoprocessing/legacy-project-import/legacy-piece-importers/file-readers/dat-file.delimiter-finder.fake';
import {
  PuDatReader,
  PuDatRow,
} from '@marxan-geoprocessing/legacy-project-import/legacy-piece-importers/file-readers/pu-dat.reader';
import { ScenarioPusDataLegacyProjectPieceImporter } from '@marxan-geoprocessing/legacy-project-import/legacy-piece-importers/scenarios-pus-data.legacy-piece-importer';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import {
  LegacyProjectImportFilesMemoryRepository,
  LegacyProjectImportFilesRepository,
  LegacyProjectImportFileType,
  LegacyProjectImportJobInput,
  LegacyProjectImportPiece,
} from '@marxan/legacy-project-import';
import {
  ScenariosPuCostDataGeo,
  ScenariosPuPaDataGeo,
} from '@marxan/scenarios-planning-unit';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Test } from '@nestjs/testing';
import {
  getEntityManagerToken,
  getRepositoryToken,
  TypeOrmModule,
} from '@nestjs/typeorm';
import { Either, isLeft, left, right } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { EntityManager, In, Repository } from 'typeorm';
import { v4 } from 'uuid';
import { DeleteProjectPus, GivenProjectPus } from '../cloning/fixtures';
import { FakeLogger } from '@marxan-api/utils/__mocks__/fake-logger';

let fixtures: FixtureType<typeof getFixtures>;

describe(ScenarioPusDataLegacyProjectPieceImporter, () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  }, 10_000);

  afterEach(async () => {
    await fixtures?.cleanUp();
  });

  it('fails when pu.dat is missing in files array', async () => {
    const job = fixtures.GivenJobInput({
      missingPuDatFile: true,
    });

    await fixtures
      .WhenPieceImporterIsInvoked(job)
      .ThenAPuDatFileNotFoundErrorShouldBeThrown();
  });

  it('fails when pu.dat cannot be retrieved from files repo', async () => {
    const job = fixtures.GivenJobInput();

    await fixtures
      .WhenPieceImporterIsInvoked(job)
      .ThenAPuDatFileNotFoundInFilesRepoErrorShouldBeThrown();
  });

  it('fails when invalid delimiter is used on pu.dat', async () => {
    const location = await fixtures.GivenPuDatIsAvailableInLegacyProjectImportFilesRepository();
    const job = fixtures.GivenJobInput({ fileLocation: location });
    fixtures.GivenSpecDatFileWithInvalidDelimiter();

    await fixtures
      .WhenPieceImporterIsInvoked(job)
      .ThenAPuDatFileInvalidDelimiterErrorShouldBeThrown();
  });

  it('fails when read operation on pu.dat fails', async () => {
    const location = await fixtures.GivenPuDatIsAvailableInLegacyProjectImportFilesRepository();
    const job = fixtures.GivenJobInput({ fileLocation: location });
    fixtures.GivenInvalidPuDatFile();

    await fixtures
      .WhenPieceImporterIsInvoked(job)
      .ThenAPuDatReadOperationErrorShouldBeThrown();
  });

  it('fails when pu.dat file contains duplicate puids', async () => {
    const location = await fixtures.GivenPuDatIsAvailableInLegacyProjectImportFilesRepository();
    const job = fixtures.GivenJobInput({ fileLocation: location });
    fixtures.GivenPuDatFileWithDuplicatePuids();

    await fixtures
      .WhenPieceImporterIsInvoked(job)
      .ThenADuplicatePuidsErrorShouldBeThrown();
  });

  it('fails when pu.dat file does not contain some projects pu data', async () => {
    const location = await fixtures.GivenPuDatIsAvailableInLegacyProjectImportFilesRepository();
    const job = fixtures.GivenJobInput({ fileLocation: location });
    await fixtures.GivenValidPuDatFile();
    fixtures.GivenPuDatLacksProjectPuDataRows();

    await fixtures
      .WhenPieceImporterIsInvoked(job)
      .ThenAMissingPlanningUnitsDataErrorShouldBeThrown();
  });

  it('reports warnings when pu.dat contains unknown puids', async () => {
    const location = await fixtures.GivenPuDatIsAvailableInLegacyProjectImportFilesRepository();
    const job = fixtures.GivenJobInput({ fileLocation: location });
    await fixtures.GivenValidPuDatFile();
    fixtures.GivenPuDatFileWithUnknownPlanningUnits();

    await fixtures
      .WhenPieceImporterIsInvoked(job)
      .ThenScenarioPusDataShouldBeImported([
        'Some planning units were not found',
      ]);
  });

  it('imports successfully scenario pus data and scenario pus cost data', async () => {
    const location = await fixtures.GivenPuDatIsAvailableInLegacyProjectImportFilesRepository();
    const job = fixtures.GivenJobInput({ fileLocation: location });
    await fixtures.GivenValidPuDatFile();

    await fixtures
      .WhenPieceImporterIsInvoked(job)
      .ThenScenarioPusDataShouldBeImported();
  });
});

const getFixtures = async () => {
  const sandbox = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        ...geoprocessingConnections.default,
        keepConnectionAlive: true,
        logging: false,
      }),
      TypeOrmModule.forFeature(
        [ScenariosPuPaDataGeo, ScenariosPuCostDataGeo],
        geoprocessingConnections.default,
      ),
    ],
    providers: [
      ScenarioPusDataLegacyProjectPieceImporter,
      {
        provide: LegacyProjectImportFilesRepository,
        useClass: LegacyProjectImportFilesMemoryRepository,
      },
      {
        provide: PuDatReader,
        useClass: FakePuDatReader,
      },
      {
        provide: DatFileDelimiterFinder,
        useClass: DatFileDelimiterFinderFake,
      },
    ],
  }).compile();

  await sandbox.init();
  sandbox.useLogger(new FakeLogger());

  const projectId = v4();
  const scenarioId = v4();

  const sut = sandbox.get(ScenarioPusDataLegacyProjectPieceImporter);
  const filesRepo = sandbox.get(LegacyProjectImportFilesRepository);
  const fakePuDatReader: FakePuDatReader = sandbox.get(PuDatReader);
  const fakeDatFileDelimiterFinder: DatFileDelimiterFinderFake = sandbox.get(
    DatFileDelimiterFinder,
  );
  const geoEntityManager = sandbox.get<EntityManager>(
    getEntityManagerToken(geoprocessingConnections.default.name),
  );
  const scenarioPusDataRepo = sandbox.get<Repository<ScenariosPuPaDataGeo>>(
    getRepositoryToken(
      ScenariosPuPaDataGeo,
      geoprocessingConnections.default.name,
    ),
  );
  const scenarioPusCostDataRepo = sandbox.get<
    Repository<ScenariosPuCostDataGeo>
  >(
    getRepositoryToken(
      ScenariosPuCostDataGeo,
      geoprocessingConnections.default.name,
    ),
  );

  const fileType = LegacyProjectImportFileType.PuDat;

  const readOperationError = 'error reading pu.dat file';
  const puDatRows: PuDatRow[] = [];
  const amountOfPlanningUnits = 50;

  return {
    cleanUp: async () => {
      await DeleteProjectPus(geoEntityManager, projectId);
    },
    GivenJobInput: (
      {
        missingPuDatFile,
        fileLocation,
      }: {
        missingPuDatFile?: boolean;
        fileLocation?: string;
      } = { missingPuDatFile: false, fileLocation: 'foo/pu.dat' },
    ): LegacyProjectImportJobInput => {
      return {
        piece: LegacyProjectImportPiece.ScenarioPusData,
        files: missingPuDatFile
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
        ownerId: v4(),
      };
    },
    GivenPuDatIsAvailableInLegacyProjectImportFilesRepository: async () => {
      const result = await filesRepo.saveFile(
        projectId,
        Readable.from('test file'),
        fileType,
      );

      if (isLeft(result))
        throw new Error('file cannot be stored in files repo');

      return result.right;
    },
    GivenValidPuDatFile: async () => {
      const pus = await GivenProjectPus(
        geoEntityManager,
        projectId,
        amountOfPlanningUnits,
      );

      pus.forEach((pu, index) => {
        puDatRows.push({
          id: pu.puid,
          cost: index * 10,
          status: Math.floor(Math.random() * 3) as 0 | 1 | 2,
          xloc: index,
          yloc: index,
        });
      });

      fakePuDatReader.readOperationResult = right(puDatRows);
    },
    GivenPuDatFileWithUnknownPlanningUnits: () => {
      puDatRows.push({
        id: amountOfPlanningUnits + 10,
        cost: 1000,
        status: 0,
        xloc: 12,
        yloc: 21,
      });
      fakePuDatReader.readOperationResult = right(puDatRows);
    },
    GivenPuDatLacksProjectPuDataRows: () => {
      fakePuDatReader.readOperationResult = right(
        puDatRows.slice(0, amountOfPlanningUnits - 5),
      );
    },
    GivenPuDatFileWithDuplicatePuids: () => {
      puDatRows.push(
        {
          id: 1,
          cost: 1000,
          status: 0,
          xloc: 12,
          yloc: 21,
        },
        {
          id: 1,
          cost: 2000,
          status: 0,
          xloc: 10,
          yloc: 20,
        },
      );
      fakePuDatReader.readOperationResult = right(puDatRows);
    },
    GivenSpecDatFileWithInvalidDelimiter: () => {
      fakeDatFileDelimiterFinder.delimiterFound = left(invalidDelimiter);
    },
    GivenInvalidPuDatFile: () => {
      fakePuDatReader.readOperationResult = left(readOperationError);
    },
    WhenPieceImporterIsInvoked: (input: LegacyProjectImportJobInput) => {
      return {
        ThenAPuDatFileNotFoundErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(
            /pu.dat file not found/gi,
          );
        },
        ThenAPuDatFileNotFoundInFilesRepoErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(
            /pu.dat file not found in files repo/gi,
          );
        },
        ThenAPuDatFileInvalidDelimiterErrorShouldBeThrown: async () => {
          const invalidDelimiterError =
            'Invalid delimiter in pu.dat file. Use either comma or tabulator as your file delimiter.';
          await expect(sut.run(input)).rejects.toThrow(invalidDelimiterError);
        },
        ThenAPuDatReadOperationErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(readOperationError);
        },
        ThenADuplicatePuidsErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(
            /pu.dat file contains rows with the same puid/gi,
          );
        },
        ThenAMissingPlanningUnitsDataErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(
            /pu.dat file is missing planning units data/gi,
          );
        },
        ThenScenarioPusDataShouldBeImported: async (
          expectedWarnings: string[] = [],
        ) => {
          const result = await sut.run(input);

          const scenarioPusData = await scenarioPusDataRepo.find({
            where: {
              scenarioId,
            },
          });

          expect(scenarioPusData).toHaveLength(amountOfPlanningUnits);

          expect(
            scenarioPusData.every((scenarioPu) => {
              const xlocIsDefined = scenarioPu.xloc !== undefined;
              const ylocIsDefined = scenarioPu.yloc !== undefined;
              const statusIsDefined = scenarioPu.lockStatus !== undefined;

              return xlocIsDefined && ylocIsDefined && statusIsDefined;
            }),
          ).toBe(true);

          const costData = await scenarioPusCostDataRepo.find({
            where: {
              scenariosPuDataId: In(scenarioPusData.map((spd) => spd.id)),
            },
          });

          expect(costData).toHaveLength(amountOfPlanningUnits);
          expect(costData.every((puCostData) => puCostData.cost >= 0)).toBe(
            true,
          );

          if (expectedWarnings.length) {
            expect(result.warnings).toBeDefined();
            expect(
              expectedWarnings.every((expected) =>
                result.warnings!.some((warning) => warning.includes(expected)),
              ),
            ).toBe(true);
          }
        },
      };
    },
  };
};

class FakePuDatReader {
  public readOperationResult: Either<string, PuDatRow[]> = left(
    'default error',
  );

  async readFile(): Promise<Either<string, PuDatRow[]>> {
    return this.readOperationResult;
  }
}
