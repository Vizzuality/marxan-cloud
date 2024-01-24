import { PlanningUnitsGridPieceImporter } from '@marxan-geoprocessing/import/pieces-importers/planning-units-grid.piece-importer';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import {
  PlanningUnitsGeom,
  ProjectsPuEntity,
} from '@marxan-jobs/planning-unit-geometry';
import { ImportJobInput } from '@marxan/cloning';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import {
  ArchiveLocation,
  ClonePiece,
  ResourceKind,
} from '@marxan/cloning/domain';
import { ClonePieceRelativePathResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import { PlanningUnitGridShape } from '@marxan/scenarios-planning-unit';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Test } from '@nestjs/testing';
import {
  getEntityManagerToken,
  getRepositoryToken,
  TypeOrmModule,
} from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { EntityManager, In, Repository } from 'typeorm';
import { v4 } from 'uuid';
import { GenerateRandomGeometries } from '../fixtures';
import { GeoCloningFilesRepositoryModule } from '@marxan-geoprocessing/modules/cloning-files-repository';
import { FakeLogger } from '@marxan-geoprocessing/utils/__mocks__/fake-logger';

let fixtures: FixtureType<typeof getFixtures>;

describe(PlanningUnitsGridPieceImporter, () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  }, 10_000);

  afterEach(async () => {
    await fixtures?.cleanUp();
  });

  it('fails when planning area grid file uri is missing in uris array', async () => {
    const input = fixtures.GivenJobInputWithoutUris();
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenAnUrisArrayErrorShouldBeThrown();
  });

  it('fails when the file cannot be retrieved from file repo', async () => {
    const archiveLocation = fixtures.GivenNoGridFileIsAvailable();
    const input = fixtures.GivenJobInput(archiveLocation);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenADataNotAvailableErrorShouldBeThrown();
  });

  it('fails when file content is invalid', async () => {
    const archiveLocation = await fixtures.GivenInvalidGridFileFormat();
    const input = fixtures.GivenJobInput(archiveLocation);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenGridFormatErrorShouldBeThrown();
  });

  it('throws an error if insert operation fails', async () => {
    const archiveLocation = await fixtures.GivenInvalidGridFileContent();
    const input = fixtures.GivenJobInput(archiveLocation);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenInsertErrorShouldBeThrown();
  });

  it('imports planning units grid', async () => {
    const archiveLocation = await fixtures.GivenValidGridFile();
    const input = fixtures.GivenJobInput(archiveLocation);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenPlanningUnitsGeometriesShouldBeInserted();
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
      TypeOrmModule.forFeature([PlanningUnitsGeom, ProjectsPuEntity]),
      GeoCloningFilesRepositoryModule,
    ],
    providers: [
      PlanningUnitsGridPieceImporter,
      {
        provide: getEntityManagerToken(geoprocessingConnections.apiDB.name),
        useClass: FakeEntityManager,
      },
    ],
  }).compile();

  await sandbox.init();
  sandbox.useLogger(new FakeLogger());

  const projectId = v4();
  const userId = v4();
  const sut = sandbox.get(PlanningUnitsGridPieceImporter);
  const fileRepository = sandbox.get(CloningFilesRepository);
  const entityManager = sandbox.get<EntityManager>(getEntityManagerToken());
  const puGeomRepo = sandbox.get<Repository<PlanningUnitsGeom>>(
    getRepositoryToken(PlanningUnitsGeom),
  );
  const projectsPuRepo = sandbox.get<Repository<ProjectsPuEntity>>(
    getRepositoryToken(ProjectsPuEntity),
  );
  const amountOfPlanningUnits = 5;

  return {
    cleanUp: async () => {
      const pus = await projectsPuRepo.find({ where: { projectId } });
      await projectsPuRepo.delete({ projectId });
      await puGeomRepo.delete({
        id: In(pus.map((pu) => pu.geomId)),
      });
    },
    GivenNoGridFileIsAvailable: () => {
      return new ArchiveLocation('not found');
    },
    GivenInvalidGridFileFormat: async (): Promise<ArchiveLocation> => {
      const invalidGridFile = '1,[1,2,4\n';
      const exportId = v4();
      const relativePath = ClonePieceRelativePathResolver.resolveFor(
        ClonePiece.PlanningUnitsGrid,
      );

      const uriOrError = await fileRepository.saveCloningFile(
        exportId,
        Readable.from(invalidGridFile),
        relativePath,
      );

      if (isLeft(uriOrError)) throw new Error("couldn't save file");
      return new ArchiveLocation(uriOrError.right);
    },
    GivenValidGridFile: async () => {
      const geometries = await GenerateRandomGeometries(
        entityManager,
        amountOfPlanningUnits,
      );
      const validGridFile = geometries
        .map((geom, index) => `${index + 1},[${geom.toJSON().data}]\n`)
        .join('');

      const exportId = v4();
      const relativePath = ClonePieceRelativePathResolver.resolveFor(
        ClonePiece.PlanningUnitsGrid,
      );

      const uriOrError = await fileRepository.saveCloningFile(
        exportId,
        Readable.from(validGridFile),
        relativePath,
      );

      if (isLeft(uriOrError)) throw new Error("couldn't save file");
      return new ArchiveLocation(uriOrError.right);
    },
    GivenInvalidGridFileContent: async (): Promise<ArchiveLocation> => {
      const invalidGridFile = '1,[1,2,4]\n';
      const exportId = v4();
      const relativePath = ClonePieceRelativePathResolver.resolveFor(
        ClonePiece.PlanningUnitsGrid,
      );

      const uriOrError = await fileRepository.saveCloningFile(
        exportId,
        Readable.from(invalidGridFile),
        relativePath,
      );

      if (isLeft(uriOrError)) throw new Error("couldn't save file");
      return new ArchiveLocation(uriOrError.right);
    },
    GivenJobInput: (archiveLocation: ArchiveLocation): ImportJobInput => {
      const relativePath = ClonePieceRelativePathResolver.resolveFor(
        ClonePiece.PlanningUnitsGrid,
      );
      return {
        componentId: v4(),
        pieceResourceId: v4(),
        importId: v4(),
        projectId,
        piece: ClonePiece.PlanningUnitsGrid,
        resourceKind: ResourceKind.Project,
        uris: [{ relativePath, uri: archiveLocation.value }],
        ownerId: userId,
      };
    },
    GivenJobInputWithoutUris: (): ImportJobInput => {
      return {
        componentId: v4(),
        pieceResourceId: v4(),
        importId: v4(),
        projectId,
        piece: ClonePiece.PlanningUnitsGrid,
        resourceKind: ResourceKind.Project,
        uris: [],
        ownerId: userId,
      };
    },
    WhenPieceImporterIsInvoked: (input: ImportJobInput) => {
      return {
        ThenInsertErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(
            /WKB structure does not match expected size/gi,
          );
        },
        ThenAnUrisArrayErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(/uris/gi);
        },
        ThenADataNotAvailableErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(
            /File with piece data for/gi,
          );
        },
        ThenGridFormatErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(/unknown line format/gi);
        },
        ThenPlanningUnitsGeometriesShouldBeInserted: async () => {
          const result = await sut.run(input);
          const pus = await projectsPuRepo.find({
            relations: ['puGeom'],
            where: {
              projectId: result.projectId,
            },
          });
          expect(pus).toHaveLength(amountOfPlanningUnits);
          expect(pus.every((pu) => pu.puGeom !== undefined)).toBe(true);
        },
      };
    },
  };
};

class FakeEntityManager {
  createQueryBuilder = () => this;
  select = () => this;
  from = () => this;
  where = () => this;

  async execute() {
    return [{ geomType: PlanningUnitGridShape.Square }];
  }
}
