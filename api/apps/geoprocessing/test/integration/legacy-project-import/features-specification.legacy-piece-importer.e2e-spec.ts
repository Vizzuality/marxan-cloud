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
import {
  PlanningUnitsGeom,
  ProjectsPuEntity,
} from '@marxan-jobs/planning-unit-geometry';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ScenarioFeaturesData } from '@marxan/features';
import { GeoFeatureGeometry, GeometrySource } from '@marxan/geofeatures';
import {
  LegacyProjectImportFilesMemoryRepository,
  LegacyProjectImportFilesRepository,
  LegacyProjectImportFileType,
  LegacyProjectImportJobInput,
  LegacyProjectImportPiece,
} from '@marxan/legacy-project-import';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { HttpService, HttpStatus, Logger } from '@nestjs/common';
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
  FeaturesSpecificationLegacyProjectPieceImporter,
  retriesIntervalForSpecificationStatusInSeconds,
} from '../../../src/legacy-project-import/legacy-piece-importers/features-specification.legacy-piece-importer';
import {
  specDatFeatureIdPropertyKey,
  specDatPuidPropertyKey,
} from '../../../src/legacy-project-import/legacy-piece-importers/features.legacy-piece-importer';
import {
  DeleteFeatures,
  DeleteProjectAndOrganization,
  DeleteProjectPus,
  DeleteUser,
  GivenProjectExists,
  GivenProjectPus,
  GivenUserExists,
} from '../cloning/fixtures';

let fixtures: FixtureType<typeof getFixtures>;
// needs to be comfortably > than the retries interval when polling for
// status
const timeoutForTestsThatNeedToCheckSpecificationJobStatus =
  2 * retriesIntervalForSpecificationStatusInSeconds * 1000;

describe(FeaturesSpecificationLegacyProjectPieceImporter, () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  }, 10_000);

  afterEach(async () => {
    await fixtures?.cleanUp();
  });

  it('fails when spec.dat file is missing in files array', async () => {
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
    const location = await fixtures.GivenDatFileIsAvailableInFilesRepository(
      specDatFileType,
    );
    const job = fixtures.GivenJobInput({ specDatFileLocation: location });
    fixtures.GivenSpecDatFileWithInvalidDelimiter();

    await fixtures
      .WhenPieceImporterIsInvoked(job)
      .ThenADatFileInvalidDelimiterErrorShouldBeThrown(specDatFileType);
  });

  it('fails when read operation on spec.dat fails', async () => {
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
    fixtures.GivenInvalidSpecDatFile();

    await fixtures
      .WhenPieceImporterIsInvoked(job)
      .ThenADatFileReadOperationErrorShouldBeThrown(specDatFileType);
  });

  it('fails when puvspr.dat file is missing in files array', async () => {
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

  it(`fails when specification request returns a code different to ${HttpStatus.CREATED}`, async () => {
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
    fixtures.GivenValidPuvsprDatFile();

    fixtures.GivenSpecificationRequestWillFail();

    await fixtures
      .WhenPieceImporterIsInvoked(job)
      .ThenASpecificationRequestErrorShouldBeThrown();
  });

  it(
    `fails when specification async job fails`,
    async () => {
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
      fixtures.GivenValidPuvsprDatFile();

      await fixtures
        .WhenPieceImporterIsInvoked(job)
        .AndSpecificationProcessFails()
        .ThenASpecificationDidntFinishErrorShouldBeThrown();
    },
    timeoutForTestsThatNeedToCheckSpecificationJobStatus,
  );

  it(
    `fails when specification async job times out`,
    async () => {
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
      fixtures.GivenValidPuvsprDatFile();

      await fixtures
        .WhenPieceImporterIsInvoked(job, 2)
        .AndSpecificationProcessTimesOut()
        .ThenASpecificationDidntFinishErrorShouldBeThrown();
    },
    timeoutForTestsThatNeedToCheckSpecificationJobStatus * 2,
  );

  it(
    `fails if features data records does not contain required properties`,
    async () => {
      const specDatFileType = LegacyProjectImportFileType.SpecDat;
      const puvsprDatFileType = LegacyProjectImportFileType.PuvsprDat;

      const specDatFileLocation = await fixtures.GivenDatFileIsAvailableInFilesRepository(
        specDatFileType,
      );
      const puvsprDatFileLocation = await fixtures.GivenDatFileIsAvailableInFilesRepository(
        puvsprDatFileType,
      );

      await fixtures.GivenProjectExist();
      const job = fixtures.GivenJobInput({
        specDatFileLocation,
        puvsprDatFileLocation,
      });
      fixtures.GivenValidSpecDatFile();
      fixtures.GivenValidPuvsprDatFile();

      await fixtures.GivenFeaturesData({ includeRequiredProperties: false });

      await fixtures
        .WhenPieceImporterIsInvoked(job)
        .AndSpecificationProcessSucceeds()
        .ThenAMissingRequiredPropertiesErrorShouldBeThrown();
    },
    timeoutForTestsThatNeedToCheckSpecificationJobStatus,
  );

  it('fails if puvspr.dat contains features not present in spec.dat', async () => {
    const specDatFileType = LegacyProjectImportFileType.SpecDat;
    const puvsprDatFileType = LegacyProjectImportFileType.PuvsprDat;

    const specDatFileLocation = await fixtures.GivenDatFileIsAvailableInFilesRepository(
      specDatFileType,
    );
    const puvsprDatFileLocation = await fixtures.GivenDatFileIsAvailableInFilesRepository(
      puvsprDatFileType,
    );

    await fixtures.GivenProjectExist();
    const job = fixtures.GivenJobInput({
      specDatFileLocation,
      puvsprDatFileLocation,
    });
    fixtures.GivenValidSpecDatFile();
    fixtures.GivenPuvsprDatFileWithUnknownFeature();

    await fixtures.GivenFeaturesData();

    await fixtures
      .WhenPieceImporterIsInvoked(job)
      .AndSpecificationProcessSucceeds()
      .ThenPuvsprContainsUnknownFeaturesErrorShouldBeThrown();
  });

  it(
    'imports successfully scenario features data',
    async () => {
      const specDatFileType = LegacyProjectImportFileType.SpecDat;
      const puvsprDatFileType = LegacyProjectImportFileType.PuvsprDat;

      const specDatFileLocation = await fixtures.GivenDatFileIsAvailableInFilesRepository(
        specDatFileType,
      );
      const puvsprDatFileLocation = await fixtures.GivenDatFileIsAvailableInFilesRepository(
        puvsprDatFileType,
      );

      await fixtures.GivenProjectExist();
      const job = fixtures.GivenJobInput({
        specDatFileLocation,
        puvsprDatFileLocation,
      });
      fixtures.GivenValidSpecDatFile();
      fixtures.GivenValidPuvsprDatFile();

      await fixtures.GivenFeaturesData();

      await fixtures
        .WhenPieceImporterIsInvoked(job)
        .AndSpecificationProcessSucceeds()
        .ThenScenarioFeaturesDataShouldBeImported();
    },
    timeoutForTestsThatNeedToCheckSpecificationJobStatus,
  );
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
        [GeoFeatureGeometry, ScenarioFeaturesData, PlanningUnitsGeom],
        geoprocessingConnections.default,
      ),
      TypeOrmModule.forRoot({
        ...geoprocessingConnections.apiDB,
        keepConnectionAlive: true,
        logging: false,
      }),
    ],
    providers: [
      FeaturesSpecificationLegacyProjectPieceImporter,
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
      {
        provide: HttpService,
        useClass: FakeHttpService,
      },
      { provide: Logger, useValue: { error: () => {}, setContext: () => {} } },
    ],
  }).compile();

  await sandbox.init();
  const organizationId = v4();
  const projectId = v4();
  const scenarioId = v4();
  const ownerId = v4();
  const specificationId = v4();

  const amountOfFeatures = 4;
  const amountOfPlanningUnits = 4;

  const sut = sandbox.get(FeaturesSpecificationLegacyProjectPieceImporter);
  const filesRepo = sandbox.get(LegacyProjectImportFilesRepository);
  const fakeSpecDatReader: FakeSpecDatReader = sandbox.get(SpecDatReader);
  const fakePuvsprDatReader: FakePuvsprDatReader = sandbox.get(PuvsprDatReader);
  const fakeDatFileDelimiterFinder: DatFileDelimiterFinderFake = sandbox.get(
    DatFileDelimiterFinder,
  );
  const fakeHttpService: FakeHttpService = sandbox.get(HttpService);

  const apiEntityManager = sandbox.get<EntityManager>(
    getEntityManagerToken(geoprocessingConnections.apiDB),
  );
  const geoEntityManager = sandbox.get<EntityManager>(
    getEntityManagerToken(geoprocessingConnections.default.name),
  );
  const featuresDataRepo = sandbox.get<Repository<GeoFeatureGeometry>>(
    getRepositoryToken(GeoFeatureGeometry),
  );
  const scenarioFeaturesDataRepo = sandbox.get<
    Repository<ScenarioFeaturesData>
  >(getRepositoryToken(ScenarioFeaturesData));
  const planningUnitsGeomRepo = sandbox.get<Repository<PlanningUnitsGeom>>(
    getRepositoryToken(PlanningUnitsGeom),
  );

  const specDatFileType = LegacyProjectImportFileType.SpecDat;
  const puvsprDatFileType = LegacyProjectImportFileType.PuvsprDat;

  let featuresData: GeoFeatureGeometry[] = [];

  const readOperationError = (file: LegacyProjectImportFileType) =>
    `error reading ${file} file`;
  const invalidDelimiterError = (file: LegacyProjectImportFileType) =>
    `Invalid delimiter in ${file} file. Use either comma or tabulator as your file delimiter.`;

  const featuresIds: string[] = [];

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
    firstFeature.puids.push(puids[0]);
    secondFeature.puids.push(puids[1]);
    thirdFeature.puids.push(puids[2]);
    fourthFeature.puids.push(puids[3]);

    return [firstFeature, secondFeature, thirdFeature, fourthFeature];
  };

  const pus = await GivenProjectPus(
    geoEntityManager,
    projectId,
    amountOfPlanningUnits,
  );

  const insertApiEvent = async (kind: API_EVENT_KINDS): Promise<void> => {
    await apiEntityManager
      .createQueryBuilder()
      .insert()
      .into('api_events')
      .values({ kind, topic: scenarioId, data: {} })
      .execute();
  };

  const insertScenarioFeaturesData = async (): Promise<void> => {
    await insertApiEvent(
      API_EVENT_KINDS.scenario__specification__finished__v1__alpha1,
    );

    await scenarioFeaturesDataRepo.save(
      featuresData.map((fd) => ({
        featureDataId: fd.id,
        scenarioId,
        apiFeatureId: fd.featureId,
        specificationId,
        totalArea: 100,
        fpf: 1,
        prop: 0.5,
      })),
    );
  };

  return {
    cleanUp: async () => {
      await DeleteProjectPus(geoEntityManager, projectId);

      await DeleteFeatures(apiEntityManager, featuresIds);

      await featuresDataRepo.delete({ featureId: In(featuresIds) });

      await apiEntityManager
        .createQueryBuilder()
        .delete()
        .from('api_events')
        .where('topic = :topic', { topic: scenarioId })
        .execute();

      await DeleteProjectAndOrganization(
        apiEntityManager,
        projectId,
        organizationId,
      );

      await DeleteUser(apiEntityManager, ownerId);
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
        piece: LegacyProjectImportPiece.FeaturesSpecification,
        files,
        pieceId: v4(),
        projectId,
        scenarioId,
        ownerId,
      };
    },
    GivenProjectExist: async () => {
      await GivenUserExists(apiEntityManager, ownerId, projectId);
      return GivenProjectExists(apiEntityManager, projectId, organizationId);
    },
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
          amount: 0.3,
          pu: puid,
        }));
      });
      fakePuvsprDatReader.readOperationResult = right(puvsprRows);
    },
    GivenPuvsprDatFileWithUnknownFeature: () => {
      const featuresWithPuids = getfeaturesWithPuids(pus);

      const puvsprRows = featuresWithPuids.flatMap(({ id, puids }) => {
        return puids.map((puid) => ({
          species: id,
          amount: 0.3,
          pu: puid,
        }));
      });
      fakePuvsprDatReader.readOperationResult = right([
        ...puvsprRows,
        { species: 1000, amount: 20, pu: puvsprRows[0].pu },
      ]);
    },
    GivenInvalidPuvsprDatFile: () => {
      fakePuvsprDatReader.readOperationResult = left(
        readOperationError(puvsprDatFileType),
      );
    },
    GivenSpecificationRequestWillFail: () => {
      fakeHttpService.status = HttpStatus.BAD_REQUEST;
    },
    GivenFeaturesData: async (
      {
        includeRequiredProperties,
      }: {
        includeRequiredProperties: boolean;
      } = { includeRequiredProperties: true },
    ) => {
      const specRowsOrError = await fakeSpecDatReader.readFile();
      const puvsprRowsOrError = await fakePuvsprDatReader.readFile();
      if (isLeft(puvsprRowsOrError) || isLeft(specRowsOrError))
        throw new Error('Unexpected error obtaining spec and/or puvspr rows');

      const featureIdsMap: Record<number, string> = {};

      await Promise.all(
        specRowsOrError.right.map((feature) => {
          const id = v4();
          featureIdsMap[feature.id] = id;

          return apiEntityManager
            .createQueryBuilder()
            .insert()
            .into('features')
            .values({
              id,
              feature_class_name: feature.name,
              project_id: projectId,
              creation_status: 'created',
            })
            .execute();
        }),
      );

      featuresIds.push(...Object.values(featureIdsMap));

      const geometries = await planningUnitsGeomRepo.find({
        select: ['id', 'theGeom'],
        where: {
          id: In(pus.map((pu) => pu.geomId)),
        },
      });

      featuresData = await featuresDataRepo.save(
        puvsprRowsOrError.right.map((row) => {
          const featurePu = pus.find((pu) => pu.puid === row.pu);
          if (!featurePu) {
            throw new Error(`Planning unit with ${row.pu} puid not found`);
          }
          const geometry = geometries.find(
            (geom) => geom.id === featurePu.geomId,
          );
          if (!geometry) {
            throw new Error(`Geometry with ${featurePu.geomId} id not found`);
          }

          return {
            id: v4(),
            properties: includeRequiredProperties
              ? {
                  [specDatFeatureIdPropertyKey]: row.species,
                  [specDatPuidPropertyKey]: featurePu.puid,
                }
              : {},
            source: GeometrySource.user_imported,
            featureId: featureIdsMap[row.species] ?? v4(),
            theGeom: geometry.theGeom,
          };
        }),
      );
    },
    WhenPieceImporterIsInvoked: (
      input: LegacyProjectImportJobInput,
      retries?: number,
    ) => {
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
        ThenASpecificationRequestErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(
            /specification launch request failed/gi,
          );
        },
        AndSpecificationProcessFails: () => {
          return {
            ThenASpecificationDidntFinishErrorShouldBeThrown: async () => {
              await insertApiEvent(
                API_EVENT_KINDS.scenario__specification__failed__v1__alpha1,
              );
              await expect(sut.run(input)).rejects.toThrow(
                /specification didn't finish: specification failed/gi,
              );
            },
          };
        },
        AndSpecificationProcessTimesOut: () => {
          return {
            ThenASpecificationDidntFinishErrorShouldBeThrown: async () => {
              await expect(sut.run(input, retries)).rejects.toThrow(
                /specification didn't finish: specification timeout/gi,
              );
            },
          };
        },
        AndSpecificationProcessSucceeds: () => {
          return {
            ThenAMissingRequiredPropertiesErrorShouldBeThrown: async () => {
              await insertScenarioFeaturesData();
              await expect(sut.run(input)).rejects.toThrow(
                /scenario features data properties does not contain required properties/gi,
              );
            },
            ThenPuvsprContainsUnknownFeaturesErrorShouldBeThrown: async () => {
              await insertScenarioFeaturesData();
              await expect(sut.run(input)).rejects.toThrow(
                /puvspr.dat contains feature ids not found in spec.dat/gi,
              );
            },
            ThenScenarioFeaturesDataShouldBeImported: async () => {
              await insertScenarioFeaturesData();
              const result = await sut.run(input);
              expect(result).toBeDefined();

              const puvsprRowsOrError = await fakePuvsprDatReader.readFile();
              if (isLeft(puvsprRowsOrError))
                throw new Error('Unexpected error obtaining puvspr rows');

              const scenarioFeaturesIds = await scenarioFeaturesDataRepo.find({
                where: { scenarioId },
              });

              expect(scenarioFeaturesIds).toHaveLength(
                puvsprRowsOrError.right.length,
              );

              expect(
                scenarioFeaturesIds.every(
                  (row) => row.specificationId === specificationId,
                ),
              ).toBe(true);
            },
          };
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

class FakeHttpService {
  public status = HttpStatus.CREATED;

  post() {
    return {
      toPromise: async () => ({
        status: this.status,
      }),
    };
  }
}
