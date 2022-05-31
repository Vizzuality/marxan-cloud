import { FeaturesLegacyProjectPieceImporter } from '@marxan-geoprocessing/legacy-project-import/legacy-piece-importers/features.legacy-piece-importer';
import {
  PuvrsprDatRow,
  PuvsprDatReader,
} from '@marxan-geoprocessing/legacy-project-import/legacy-piece-importers/file-readers/puvspr-dat.reader';
import {
  SpecDatReader,
  SpecDatRow,
} from '@marxan-geoprocessing/legacy-project-import/legacy-piece-importers/file-readers/spec-dat.reader';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import {
  PlanningUnitsGeom,
  ProjectsPuEntity,
} from '@marxan-jobs/planning-unit-geometry';
import { GeoFeatureGeometry } from '@marxan/geofeatures';
import {
  LegacyProjectImportFilesMemoryRepository,
  LegacyProjectImportFilesRepository,
  LegacyProjectImportFileType,
  LegacyProjectImportJobInput,
  LegacyProjectImportPiece,
} from '@marxan/legacy-project-import';

import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Logger } from '@nestjs/common';
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
  GivenProjectExists,
  GivenProjectPus,
} from '../cloning/fixtures';

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

  it('fails when read operation on spec.dat fails', async () => {
    const specDatFileType = LegacyProjectImportFileType.SpecDat;
    const location = await fixtures.GivenDatFileIsAvailableInFilesRepository(
      specDatFileType,
    );
    const job = fixtures.GivenJobInput({ specDatFileLocation: location });
    fixtures.GivenInvalidSpecDatFile();

    await fixtures
      .WhenPieceImporterIsInvoked(job)
      .ThenADatFileReadOperationErrorShouldBeThrown(specDatFileType);
  });

  it('fails when puvspr.dat is missing in files array', async () => {
    const specDatFileType = LegacyProjectImportFileType.SpecDat;
    const puvsprDatFileType = LegacyProjectImportFileType.PuvsprDat;

    const specDatFileLocation = await fixtures.GivenDatFileIsAvailableInFilesRepository(
      specDatFileType,
    );
    const job = fixtures.GivenJobInput({ specDatFileLocation });
    fixtures.GivenValidSpecDatFile();

    await fixtures
      .WhenPieceImporterIsInvoked(job)
      .ThenADatFileNotFoundErrorShouldBeThrown(puvsprDatFileType);
  });

  it('fails when puvspr.dat cannot be retrieved from files repo', async () => {
    const specDatFileType = LegacyProjectImportFileType.SpecDat;
    const puvsprDatFileType = LegacyProjectImportFileType.PuvsprDat;

    const specDatFileLocation = await fixtures.GivenDatFileIsAvailableInFilesRepository(
      specDatFileType,
    );

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

    const specDatFileLocation = await fixtures.GivenDatFileIsAvailableInFilesRepository(
      specDatFileType,
    );
    const puvsprDatFileLocation = await fixtures.GivenDatFileIsAvailableInFilesRepository(
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

  it('imports successfully scenario pus data and scenario pus cost data', async () => {
    const specDatFileType = LegacyProjectImportFileType.SpecDat;
    const puvsprDatFileType = LegacyProjectImportFileType.PuvsprDat;

    const specDatFileLocation = await fixtures.GivenDatFileIsAvailableInFilesRepository(
      specDatFileType,
    );
    const puvsprDatFileLocation = await fixtures.GivenDatFileIsAvailableInFilesRepository(
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
      { provide: Logger, useValue: { error: () => {}, setContext: () => {} } },
    ],
  }).compile();

  await sandbox.init();
  const organizationId = v4();
  const projectId = v4();
  const scenarioId = v4();
  const amountOfFeatures = 4;
  const amountOfPlanningUnits = 4;

  const sut = sandbox.get(FeaturesLegacyProjectPieceImporter);
  const filesRepo = sandbox.get(LegacyProjectImportFilesRepository);
  const fakeSpecDatReader: FakeSpecDatReader = sandbox.get(SpecDatReader);
  const fakePuvsprDatReader: FakePuvsprDatReader = sandbox.get(PuvsprDatReader);
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
    },
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
          amount: 0.3,
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
        ThenADatFileReadOperationErrorShouldBeThrown: async (
          file: LegacyProjectImportFileType,
        ) => {
          await expect(sut.run(input)).rejects.toThrow(
            readOperationError(file),
          );
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
        ThenFeatureAndFeaturesDataShouldBeImported: async () => {
          const result = await sut.run(input);

          expect(result).toBeDefined();

          expect(result.warnings).toHaveLength(1);
          expect(result.warnings![0]).toContain(nonExistingPuid);

          const insertedFeaturesIds = await findProjectFeaturesIds();

          expect(insertedFeaturesIds).toHaveLength(amountOfFeatures);

          const amountOfNonExistingPuids = 1;
          const amountOfFeaturesData = getfeaturesWithPuids(pus).flatMap(
            (pu) => pu.puids,
          ).length;
          const insertedFeaturesData = await featuresDataRepo.find({
            featureId: In(insertedFeaturesIds),
          });

          expect(insertedFeaturesData).toHaveLength(
            amountOfFeaturesData - amountOfNonExistingPuids,
          );
        },
      };
    },
  };
};

class FakeSpecDatReader {
  public readOperationResult: Either<string, SpecDatRow[]> = left(
    'default error',
  );

  async readFile(): Promise<Either<string, SpecDatRow[]>> {
    return this.readOperationResult;
  }
}

class FakePuvsprDatReader {
  public readOperationResult: Either<string, PuvrsprDatRow[]> = left(
    'default error',
  );

  async readFile(): Promise<Either<string, PuvrsprDatRow[]>> {
    return this.readOperationResult;
  }
}
