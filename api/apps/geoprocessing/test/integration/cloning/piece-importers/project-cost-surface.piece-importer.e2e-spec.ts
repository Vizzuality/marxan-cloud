import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ImportJobInput } from '@marxan/cloning';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import {
  ArchiveLocation,
  ClonePiece,
  ResourceKind,
} from '@marxan/cloning/domain';
import { ClonePieceRelativePathResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Test } from '@nestjs/testing';
import {
  getEntityManagerToken,
  getRepositoryToken,
  TypeOrmModule,
} from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { DeepPartial, EntityManager, In, Repository } from 'typeorm';
import { v4 } from 'uuid';
import {
  DeleteProjectAndOrganization,
  GenerateRandomGeometries,
  GivenProjectExists, GivenProjectPus
} from "../fixtures";
import { GeoCloningFilesRepositoryModule } from '@marxan-geoprocessing/modules/cloning-files-repository';
import { FakeLogger } from '@marxan-geoprocessing/utils/__mocks__/fake-logger';
import {
  ProjectCostSurfacesPieceImporter
} from "@marxan-geoprocessing/import/pieces-importers/project-cost-surfaces.piece-importer";
import { ProjectCostSurfacesContent } from "@marxan/cloning/infrastructure/clone-piece-data/project-cost-surfaces";
import { CostSurfacePuDataEntity } from "@marxan/cost-surfaces";
import {
  ProjectCostSurfacesPieceExporter
} from "@marxan-geoprocessing/export/pieces-exporters/project-cost-surfaces.piece-exporter";

let fixtures: FixtureType<typeof getFixtures>;

describe(ProjectCostSurfacesPieceImporter, () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  }, 10_000);

  afterEach(async () => {
    await fixtures?.cleanUp();
  });

  it('fails when project cost surfaces file uri is missing in uris array', async () => {
    const input = fixtures.GivenJobInputWithoutUris();
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenAnUrisArrayErrorShouldBeThrown();
  });

  it('fails when the file cannot be retrieved from file repo', async () => {
    const archiveLocation = fixtures.GivenNoProjectCostSurfacesFileIsAvailable();
    const input = fixtures.GivenJobInput(archiveLocation);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenADataNotAvailableErrorShouldBeThrown();
  });

  it('imports project cost surfaces', async () => {
    const archiveLocation = await fixtures.GivenValidProjectCostSurfacesFile();
    await fixtures.GivenProject();
    await fixtures.GivenProjectPus();
    const input = fixtures.GivenJobInput(archiveLocation);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenCostSurfacesShouldBeAddedToProject();
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
      TypeOrmModule.forRoot({
        ...geoprocessingConnections.apiDB,
        keepConnectionAlive: true,
        logging: false,
      }),
      TypeOrmModule.forFeature([CostSurfacePuDataEntity]),
      TypeOrmModule.forFeature([], geoprocessingConnections.apiDB.name),
      GeoCloningFilesRepositoryModule,
    ],
    providers: [ProjectCostSurfacesPieceImporter],
  }).compile();

  await sandbox.init();
  sandbox.useLogger(new FakeLogger());

  const projectId = v4();
  const organizationId = v4();
  const userId = v4();

  const geoEntityManager = sandbox.get<EntityManager>(getEntityManagerToken());
  const apiEntityManager = sandbox.get<EntityManager>(
    getEntityManagerToken(geoprocessingConnections.apiDB.name),
  );
  const costSurfaceDataRepo = sandbox.get<Repository<CostSurfacePuDataEntity>>(
    getRepositoryToken(
      CostSurfacePuDataEntity,
      geoprocessingConnections.default.name,
    ),
  );

  const sut = sandbox.get(ProjectCostSurfacesPieceImporter);
  const fileRepository = sandbox.get(CloningFilesRepository);

  let validProjectCostSurfacesFile: DeepPartial<ProjectCostSurfacesContent>;

  return {
    cleanUp: async () => {
      const costSurfaces: {
        id: string;
      }[] = await apiEntityManager
        .createQueryBuilder()
        .select('id')
        .from('cost_surfaces', 'cs')
        .where('project_id = :projectId', { projectId })
        .execute();

      const costSurfacesIds = costSurfaces.map((cs) => cs.id);
      await costSurfaceDataRepo.delete({
        costSurfaceId: In(costSurfacesIds),
      });

      await DeleteProjectAndOrganization(
        apiEntityManager,
        projectId,
        organizationId,
      );
    },
    GivenProject: () =>
      GivenProjectExists(apiEntityManager, projectId, organizationId),
    GivenProjectPus: () =>
      GivenProjectPus(geoEntityManager, projectId, 3),
    GivenJobInput: (archiveLocation: ArchiveLocation): ImportJobInput => {
      const relativePath = ClonePieceRelativePathResolver.resolveFor(
        ClonePiece.ProjectCostSurfaces,
      );
      return {
        componentId: v4(),
        pieceResourceId: v4(),
        importId: v4(),
        projectId,
        piece: ClonePiece.ProjectCostSurfaces,
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
        piece: ClonePiece.ProjectCostSurfaces,
        resourceKind: ResourceKind.Project,
        uris: [],
        ownerId: userId,
      };
    },
    GivenNoProjectCostSurfacesFileIsAvailable: () => {
      return new ArchiveLocation('not found');
    },
    GivenValidProjectCostSurfacesFile: async () => {
      const geometries = await GenerateRandomGeometries(
        geoEntityManager,
        10,
        false,
      );

      validProjectCostSurfacesFile = {
        costSurfaces: [{
            name: 'Cost Surface',
            min: 1,
            max: 10,
            data: Array(3)
              .fill(0)
              .map((_, dataIndex) => ({
                cost: dataIndex * 2,
                puid: dataIndex + 1,
              })),
          }],
      };

      const exportId = v4();
      const relativePath = ClonePieceRelativePathResolver.resolveFor(
        ClonePiece.ProjectCostSurfaces,
      );

      const uriOrError = await fileRepository.saveCloningFile(
        exportId,
        Readable.from(JSON.stringify(validProjectCostSurfacesFile)),
        relativePath,
      );

      if (isLeft(uriOrError)) throw new Error("couldn't save file");
      return new ArchiveLocation(uriOrError.right);
    },
    WhenPieceImporterIsInvoked: (input: ImportJobInput) => {
      return {
        ThenAnUrisArrayErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(/uris/gi);
        },
        ThenADataNotAvailableErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(
            /File with piece data for/gi,
          );
        },
        ThenCostSurfacesShouldBeAddedToProject: async () => {
          await sut.run(input);

          const costSurfaces: {
            id: string;
            min: boolean;
            max: string;
            name: string;
          }[] = await apiEntityManager
            .createQueryBuilder()
            .select('cs.id')
            .addSelect('cs.min', 'min')
            .addSelect('cs.max', 'max')
            .addSelect('cs.name', 'name')
            .from('cost_surfaces', 'cs')
            .where('cs.project_id = :projectId', { projectId })
            .andWhere('cs.is_default = false')
            .execute();

          expect(costSurfaces).toHaveLength(1);
          expect(costSurfaces[0].min).toEqual(1);
          expect(costSurfaces[0].max).toEqual(10);
          expect(costSurfaces[0].name).toEqual('Cost Surface');

          const costSurfaceData = await costSurfaceDataRepo.find({
            where: {
              costSurfaceId: In(costSurfaces.map((cs) => cs.id)),
            },
          });

          expect(costSurfaceData).toHaveLength(3);
        },
      };
    },
  };
};
