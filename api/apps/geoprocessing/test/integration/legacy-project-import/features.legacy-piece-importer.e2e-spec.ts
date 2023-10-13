import { FeaturesLegacyProjectPieceImporter } from '@marxan-geoprocessing/legacy-project-import/legacy-piece-importers/features.legacy-piece-importer';
import {
  DatFileDelimiterFinder,
  invalidDelimiter,
} from '@marxan-geoprocessing/legacy-project-import/legacy-piece-importers/file-readers/dat-file.delimiter-finder';
import { DatFileDelimiterFinderFake } from '@marxan-geoprocessing/legacy-project-import/legacy-piece-importers/file-readers/dat-file.delimiter-finder.fake';
import {
  PuvrsprDatRow,
  PuvsprDatReader,
} from '@marxan-geoprocessing/legacy-project-import/legacy-piece-importers/file-readers/puvspr-dat.reader';
import {
  SpecDatReader,
  SpecDatRow,
} from '@marxan-geoprocessing/legacy-project-import/legacy-piece-importers/file-readers/spec-dat.reader';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ProjectsPuEntity } from '@marxan-jobs/planning-unit-geometry';
import { GeoFeatureGeometry } from '@marxan/geofeatures';
import {
  LegacyProjectImportFilesMemoryRepository,
  LegacyProjectImportFilesRepository,
  LegacyProjectImportFileType,
  LegacyProjectImportJobInput,
  LegacyProjectImportPiece,
} from '@marxan/legacy-project-import';
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
import {
  DeleteFeatures,
  DeleteProjectAndOrganization,
  DeleteProjectPus,
  DeleteUser,
  GivenProjectExists,
  GivenProjectPus,
  GivenUserExists,
} from '../cloning/fixtures';
import { FakeLogger } from '@marxan-geoprocessing/utils/__mocks__/fake-logger';

let fixtures: FixtureType<typeof getFixtures>;

describe(FeaturesLegacyProjectPieceImporter, () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  }, 10_000);

  afterEach(async () => {
    await fixtures?.cleanUp();
  });

  it('fails when spec.dat is missing in files array', async () => {
    const specDatFileType = LegacyProjectImportFileType.SpecDat;
    const job = fixtures.GivenJobInput({});

    await fixtures
      .WhenPieceImporterIsInvoked(job)
      .ThenADatFileNotFoundErrorShouldBeThrown(specDatFileType);
  });

  it('fails when spec.dat cannot be retrieved from files repo', async () => {
    const specDatFileType = LegacyProjectImportFileType.SpecDat;
    const job = fixtures.GivenJobInput({
      specDatFileLocation: 'wrong location',
    });

    await fixtures
      .WhenPieceImporterIsInvoked(job)
      .ThenADatFileNotFoundInFilesRepoErrorShouldBeThrown(specDatFileType);
  });

  it('fails when invalid delimiter is used on spec.dat', async () => {
    const specDatFileType = LegacyProjectImportFileType.SpecDat;
    const location =
      await fixtures.GivenDatFileIsAvailableInFilesRepository(specDatFileType);
    const job = fixtures.GivenJobInput({ specDatFileLocation: location });
    fixtures.GivenSpecDatFileWithInvalidDelimiter();

    await fixtures
      .WhenPieceImporterIsInvoked(job)
      .ThenADatFileInvalidDelimiterErrorShouldBeThrown(specDatFileType);
  });

  it('fails when read operation on spec.dat fails', async () => {
    const specDatFileType = LegacyProjectImportFileType.SpecDat;
    const location =
      await fixtures.GivenDatFileIsAvailableInFilesRepository(specDatFileType);
    const job = fixtures.GivenJobInput({ specDatFileLocation: location });
    fixtures.GivenInvalidSpecDatFile();

    await fixtures
      .WhenPieceImporterIsInvoked(job)
      .ThenADatFileReadOperationErrorShouldBeThrown(specDatFileType);
  });

  it('fails when puvspr.dat is missing in files array', async () => {
    const specDatFileType = LegacyProjectImportFileType.SpecDat;
    const puvsprDatFileType = LegacyProjectImportFileType.PuvsprDat;

    const specDatFileLocation =
      await fixtures.GivenDatFileIsAvailableInFilesRepository(specDatFileType);
    const job = fixtures.GivenJobInput({ specDatFileLocation });
    fixtures.GivenValidSpecDatFile();

    await fixtures
      .WhenPieceImporterIsInvoked(job)
      .ThenADatFileNotFoundErrorShouldBeThrown(puvsprDatFileType);
  });

  it('fails when puvspr.dat cannot be retrieved from files repo', async () => {
    const specDatFileType = LegacyProjectImportFileType.SpecDat;
    const puvsprDatFileType = LegacyProjectImportFileType.PuvsprDat;

    const specDatFileLocation =
      await fixtures.GivenDatFileIsAvailableInFilesRepository(specDatFileType);

    const job = fixtures.GivenJobInput({
      specDatFileLocation,
      puvsprDatFileLocation: 'wrong location',
    });
    fixtures.GivenValidSpecDatFile();

    await fixtures
      .WhenPieceImporterIsInvoked(job)
      .ThenADatFileNotFoundInFilesRepoErrorShouldBeThrown(puvsprDatFileType);
  });

  it('fails when read operation on puvspr.dat fails', async () => {
    const specDatFileType = LegacyProjectImportFileType.SpecDat;
    const puvsprDatFileType = LegacyProjectImportFileType.PuvsprDat;

    const specDatFileLocation =
      await fixtures.GivenDatFileIsAvailableInFilesRepository(specDatFileType);
    const puvsprDatFileLocation =
      await fixtures.GivenDatFileIsAvailableInFilesRepository(
        puvsprDatFileType,
      );

    const job = fixtures.GivenJobInput({
      specDatFileLocation,
      puvsprDatFileLocation,
    });
    fixtures.GivenValidSpecDatFile();
    fixtures.GivenInvalidPuvsprDatFile();

    await fixtures
      .WhenPieceImporterIsInvoked(job)
      .ThenADatFileReadOperationErrorShouldBeThrown(puvsprDatFileType);
  });

  it('fails if spec.dat file contains duplicate feature ids', async () => {
    const specDatFileLocation =
      await fixtures.GivenDatFileIsAvailableInFilesRepository(
        LegacyProjectImportFileType.SpecDat,
      );
    const puvsprDatFileLocation =
      await fixtures.GivenDatFileIsAvailableInFilesRepository(
        LegacyProjectImportFileType.PuvsprDat,
      );

    const job = fixtures.GivenJobInput({
      specDatFileLocation,
      puvsprDatFileLocation,
    });
    fixtures.GivenSpecDatFileWithDuplicateFeatureIds();
    fixtures.GivenValidPuvsprDatFile();

    await fixtures
      .WhenPieceImporterIsInvoked(job)
      .ThenADuplicateFeatureIdsErrorShouldBeThrown();
  });

  it('fails if spec.dat file contains duplicate feature names', async () => {
    const specDatFileLocation =
      await fixtures.GivenDatFileIsAvailableInFilesRepository(
        LegacyProjectImportFileType.SpecDat,
      );
    const puvsprDatFileLocation =
      await fixtures.GivenDatFileIsAvailableInFilesRepository(
        LegacyProjectImportFileType.PuvsprDat,
      );

    const job = fixtures.GivenJobInput({
      specDatFileLocation,
      puvsprDatFileLocation,
    });
    fixtures.GivenSpecDatFileWithDuplicateFeatureNames();
    fixtures.GivenValidPuvsprDatFile();

    await fixtures
      .WhenPieceImporterIsInvoked(job)
      .ThenADuplicateFeatureNamesErrorShouldBeThrown();
  });

  it('imports successfully features and features data', async () => {
    const specDatFileType = LegacyProjectImportFileType.SpecDat;
    const puvsprDatFileType = LegacyProjectImportFileType.PuvsprDat;

    await fixtures.GivenUserExists();
    const specDatFileLocation =
      await fixtures.GivenDatFileIsAvailableInFilesRepository(specDatFileType);
    const puvsprDatFileLocation =
      await fixtures.GivenDatFileIsAvailableInFilesRepository(
        puvsprDatFileType,
      );

    const job = fixtures.GivenJobInput({
      specDatFileLocation,
      puvsprDatFileLocation,
    });
    await fixtures.GivenProjectExist();
    fixtures.GivenValidSpecDatFile();
    fixtures.GivenValidPuvsprDatFile();

    await fixtures
      .WhenPieceImporterIsInvoked(job)
      .ThenFeatureAndFeaturesDataShouldBeImported();
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
        [ProjectsPuEntity, GeoFeatureGeometry],
        geoprocessingConnections.default,
      ),
      TypeOrmModule.forRoot({
        ...geoprocessingConnections.apiDB,
        keepConnectionAlive: true,
        logging: false,
      }),
    ],
    providers: [
      FeaturesLegacyProjectPieceImporter,
      {
        provide: LegacyProjectImportFilesRepository,
        useClass: LegacyProjectImportFilesMemoryRepository,
      },
      {
        provide: SpecDatReader,
        useClass: FakeSpecDatReader,
      },
      {
        provide: PuvsprDatReader,
        useClass: FakePuvsprDatReader,
      },
      {
        provide: DatFileDelimiterFinder,
        useClass: DatFileDelimiterFinderFake,
      },
    ],
  }).compile();

  await sandbox.init();
  sandbox.useLogger(new FakeLogger());

  const organizationId = v4();
  const projectId = v4();
  const scenarioId = v4();
  const ownerId = v4();
  const amountOfFeatures = 4;
  const amountOfPlanningUnits = 4;

  const sut = sandbox.get(FeaturesLegacyProjectPieceImporter);
  const filesRepo = sandbox.get(LegacyProjectImportFilesRepository);
  const fakeSpecDatReader: FakeSpecDatReader = sandbox.get(SpecDatReader);
  const fakePuvsprDatReader: FakePuvsprDatReader = sandbox.get(PuvsprDatReader);
  const fakeDatFileDelimiterFinder: DatFileDelimiterFinderFake = sandbox.get(
    DatFileDelimiterFinder,
  );
  const apiEntityManager = sandbox.get<EntityManager>(
    getEntityManagerToken(geoprocessingConnections.apiDB),
  );
  const geoEntityManager = sandbox.get<EntityManager>(
    getEntityManagerToken(geoprocessingConnections.default.name),
  );
  const featuresDataRepo = sandbox.get<Repository<GeoFeatureGeometry>>(
    getRepositoryToken(GeoFeatureGeometry),
  );

  const specDatFileType = LegacyProjectImportFileType.SpecDat;
  const puvsprDatFileType = LegacyProjectImportFileType.PuvsprDat;

  const readOperationError = (file: LegacyProjectImportFileType) =>
    `error reading ${file} file`;
  const invalidDelimiterError = (file: LegacyProjectImportFileType) =>
    `Invalid delimiter in ${file} file. Use either comma or tabulator as your file delimiter.`;

  const findProjectFeaturesIds = async (): Promise<string[]> => {
    const result: {
      id: string;
    }[] = await apiEntityManager
      .createQueryBuilder()
      .select('id')
      .from('features', 'f')
      .where('project_id = :projectId', { projectId })
      .execute();

    return result.map(({ id }) => id);
  };

  const nonExistingPuid = 1000;

  const getfeaturesWithPuids = (pus: ProjectsPuEntity[]) => {
    const [firstFeature, secondFeature, thirdFeature, fourthFeature] = Array(
      amountOfFeatures,
    )
      .fill('')
      .map<{ id: number; name: string; prop: number; puids: number[] }>(
        (_, index) => ({
          id: index,
          name: `feature ${index}`,
          prop: index / 4,
          puids: [],
        }),
      );
    const puids = pus.map(({ puid }) => puid);
    firstFeature.puids.push(...[puids[0], puids[amountOfPlanningUnits - 1]]);
    secondFeature.puids.push(puids[amountOfPlanningUnits - 1]);
    thirdFeature.puids.push(...puids);
    fourthFeature.puids.push(puids[0], nonExistingPuid);

    return [firstFeature, secondFeature, thirdFeature, fourthFeature];
  };

  const expectedAmount = 100;
  const pus = await GivenProjectPus(
    geoEntityManager,
    projectId,
    amountOfPlanningUnits,
  );

  return {
    cleanUp: async () => {
      await DeleteProjectPus(geoEntityManager, projectId);

      const featuresIds = await findProjectFeaturesIds();

      await DeleteFeatures(apiEntityManager, featuresIds);

      await featuresDataRepo.delete({ featureId: In(featuresIds) });

      await DeleteProjectAndOrganization(
        apiEntityManager,
        projectId,
        organizationId,
      );

      await DeleteUser(apiEntityManager, ownerId);
    },
    GivenUserExists: () =>
      GivenUserExists(apiEntityManager, ownerId, projectId),
    GivenJobInput: ({
      specDatFileLocation,
      puvsprDatFileLocation,
    }: {
      specDatFileLocation?: string;
      puvsprDatFileLocation?: string;
    }): LegacyProjectImportJobInput => {
      const files = [];

      if (specDatFileLocation)
        files.push({
          id: v4(),
          location: specDatFileLocation,
          type: specDatFileType,
        });

      if (puvsprDatFileLocation)
        files.push({
          id: v4(),
          location: puvsprDatFileLocation,
          type: puvsprDatFileType,
        });

      return {
        piece: LegacyProjectImportPiece.Features,
        files,
        pieceId: v4(),
        projectId,
        scenarioId,
        ownerId,
      };
    },
    GivenProjectExist: async () =>
      GivenProjectExists(apiEntityManager, projectId, organizationId),
    GivenDatFileIsAvailableInFilesRepository: async (
      file: LegacyProjectImportFileType,
    ) => {
      const result = await filesRepo.saveFile(
        projectId,
        Readable.from('test file'),
        file,
      );

      if (isLeft(result))
        throw new Error('file cannot be stored in files repo');

      return result.right;
    },
    GivenValidSpecDatFile: () => {
      const specRows = getfeaturesWithPuids(pus).map(
        ({ puids, ...feature }) => feature,
      );
      fakeSpecDatReader.readOperationResult = right(specRows);
    },
    GivenSpecDatFileWithDuplicateFeatureIds: () => {
      fakeSpecDatReader.readOperationResult = right([
        { id: 1, prop: 0.1, name: 'first' },
        { id: 1, prop: 0.5, name: 'second' },
      ]);
    },
    GivenSpecDatFileWithDuplicateFeatureNames: () => {
      fakeSpecDatReader.readOperationResult = right([
        { id: 1, prop: 0.1, name: 'first' },
        { id: 2, prop: 0.5, name: 'first' },
      ]);
    },
    GivenSpecDatFileWithInvalidDelimiter: () => {
      fakeDatFileDelimiterFinder.delimiterFound = left(invalidDelimiter);
    },
    GivenInvalidSpecDatFile: () => {
      fakeSpecDatReader.readOperationResult = left(
        readOperationError(specDatFileType),
      );
    },
    GivenValidPuvsprDatFile: () => {
      const featuresWithPuids = getfeaturesWithPuids(pus);

      const puvsprRows = featuresWithPuids.flatMap(({ id, puids }) => {
        return puids.map((puid) => ({
          species: id,
          amount: expectedAmount,
          pu: puid,
        }));
      });
      fakePuvsprDatReader.readOperationResult = right(puvsprRows);
    },
    GivenInvalidPuvsprDatFile: () => {
      fakePuvsprDatReader.readOperationResult = left(
        readOperationError(puvsprDatFileType),
      );
    },
    WhenPieceImporterIsInvoked: (input: LegacyProjectImportJobInput) => {
      return {
        ThenADatFileNotFoundErrorShouldBeThrown: async (
          file: LegacyProjectImportFileType,
        ) => {
          await expect(sut.run(input)).rejects.toThrow(
            new RegExp(`${file} file not found inside input file array`, 'gi'),
          );
        },
        ThenADatFileNotFoundInFilesRepoErrorShouldBeThrown: async (
          file: LegacyProjectImportFileType,
        ) => {
          await expect(sut.run(input)).rejects.toThrow(
            new RegExp(`${file} file not found in files repo`, 'gi'),
          );
        },
        ThenADatFileInvalidDelimiterErrorShouldBeThrown: async (
          file: LegacyProjectImportFileType,
        ) => {
          await expect(sut.run(input)).rejects.toThrow(
            invalidDelimiterError(file),
          );
        },
        ThenADatFileReadOperationErrorShouldBeThrown: async (
          file: LegacyProjectImportFileType,
        ) => {
          await expect(sut.run(input)).rejects.toThrow(
            readOperationError(file),
          );
        },
        ThenADuplicateFeatureIdsErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(
            /spec.dat contains duplicate feature ids/gi,
          );
        },
        ThenADuplicateFeatureNamesErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(
            /spec.dat contains duplicate feature names/gi,
          );
        },
        ThenFeatureAndFeaturesDataShouldBeImported: async () => {
          const result = await sut.run(input);

          expect(result).toBeDefined();

          expect(result.warnings).toHaveLength(1);
          expect(result.warnings![0]).toContain(nonExistingPuid.toString());

          const insertedFeaturesIds = await findProjectFeaturesIds();

          expect(insertedFeaturesIds).toHaveLength(amountOfFeatures);

          const amountOfNonExistingPuids = 1;
          const amountOfFeaturesData = getfeaturesWithPuids(pus).flatMap(
            (pu) => pu.puids,
          ).length;
          const insertedFeaturesData = await featuresDataRepo.find({
            where: {
              featureId: In(insertedFeaturesIds),
            },
          });

          expect(insertedFeaturesData).toHaveLength(
            amountOfFeaturesData - amountOfNonExistingPuids,
          );
          expect(
            insertedFeaturesData.every(
              ({ amount, projectPuId }) =>
                amount === expectedAmount &&
                projectPuId &&
                pus.map(({ id }) => id).includes(projectPuId),
            ),
          ).toEqual(true);
        },
      };
    },
  };
};

class FakeSpecDatReader {
  public readOperationResult: Either<string, SpecDatRow[]> =
    left('default error');

  async readFile(): Promise<Either<string, SpecDatRow[]>> {
    return this.readOperationResult;
  }
}

class FakePuvsprDatReader {
  public readOperationResult: Either<string, PuvrsprDatRow[]> =
    left('default error');

  async readFile(): Promise<Either<string, PuvrsprDatRow[]>> {
    return this.readOperationResult;
  }
}
