import { PlanningAreaCustomPieceImporter } from '@marxan-geoprocessing/import/pieces-importers/planning-area-custom.piece-importer';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ImportJobInput } from '@marxan/cloning';
import {
  ArchiveLocation,
  ClonePiece,
  ResourceKind,
} from '@marxan/cloning/domain';
import { ClonePieceUrisResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import { PlanningAreaCustomContent } from '@marxan/cloning/infrastructure/clone-piece-data/planning-area-custom';
import {
  CloningFilesRepository,
  CloningFileSRepositoryModule,
} from '@marxan/cloning-files-repository';
import { PlanningArea } from '@marxan/planning-area-repository/planning-area.geo.entity';
import { PlanningUnitGridShape } from '@marxan/scenarios-planning-unit';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {
  getEntityManagerToken,
  getRepositoryToken,
  TypeOrmModule,
} from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { v4 } from 'uuid';
import {
  DeleteProjectAndOrganization,
  GenerateRandomGeometries,
  GivenProjectExists,
  PrepareZipFile,
} from '../fixtures';

let fixtures: FixtureType<typeof getFixtures>;

describe(PlanningAreaCustomPieceImporter, () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  }, 10_000);

  afterEach(async () => {
    await fixtures?.cleanUp();
  });

  it('fails when custom planning area file uri is missing in uris array', async () => {
    const input = fixtures.GivenJobInputWithoutUris();
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenAnUrisArrayErrorShouldBeThrown();
  });

  it('fails when the file cannot be retrieved from file repo', async () => {
    const archiveLocation = fixtures.GivenNoCustomPlanningAreaFileIsAvailable();
    const input = fixtures.GivenJobInput(archiveLocation);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenADataNotAvailableErrorShouldBeThrown();
  });

  it('imports planning area and updates project', async () => {
    await fixtures.GivenProject();
    const archiveLocation = await fixtures.GivenValidCustomPlanningAreaFile();
    const input = fixtures.GivenJobInput(archiveLocation);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenPlanningAreaShouldBeInsertedAndProjectUpdated();
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
        [PlanningArea],
        geoprocessingConnections.default.name,
      ),
      TypeOrmModule.forRoot({
        ...geoprocessingConnections.apiDB,
        keepConnectionAlive: true,
        logging: false,
      }),
      CloningFileSRepositoryModule,
    ],
    providers: [
      PlanningAreaCustomPieceImporter,
      { provide: Logger, useValue: { error: () => {}, setContext: () => {} } },
    ],
  }).compile();

  await sandbox.init();
  const organizationId = v4();
  const projectId = v4();
  const userId = v4();

  const entityManager = sandbox.get<EntityManager>(
    getEntityManagerToken(geoprocessingConnections.apiDB.name),
  );
  const planningAreaRepo = sandbox.get<Repository<PlanningArea>>(
    getRepositoryToken(PlanningArea, geoprocessingConnections.default.name),
  );
  const sut = sandbox.get(PlanningAreaCustomPieceImporter);
  const fileRepository = sandbox.get(CloningFilesRepository);

  return {
    cleanUp: async () => {
      await DeleteProjectAndOrganization(
        entityManager,
        projectId,
        organizationId,
      );
      await planningAreaRepo.delete({ projectId });
    },
    GivenProject: () =>
      GivenProjectExists(entityManager, projectId, organizationId),
    GivenJobInput: (archiveLocation: ArchiveLocation): ImportJobInput => {
      const [uri] = ClonePieceUrisResolver.resolveFor(
        ClonePiece.PlanningAreaCustom,
        archiveLocation.value,
      );
      return {
        componentId: v4(),
        pieceResourceId: v4(),
        importId: v4(),
        projectId,
        piece: ClonePiece.PlanningAreaCustom,
        resourceKind: ResourceKind.Project,
        uris: [uri.toSnapshot()],
        ownerId: userId,
      };
    },
    GivenJobInputWithoutUris: (): ImportJobInput => {
      return {
        componentId: v4(),
        pieceResourceId: v4(),
        importId: v4(),
        projectId,
        piece: ClonePiece.PlanningAreaCustom,
        resourceKind: ResourceKind.Project,
        uris: [],
        ownerId: userId,
      };
    },
    GivenNoCustomPlanningAreaFileIsAvailable: () => {
      return new ArchiveLocation('not found');
    },
    GivenValidCustomPlanningAreaFile: async () => {
      const [geom] = await GenerateRandomGeometries(entityManager, 1, true);

      const validCustomPlanningAreaFile: PlanningAreaCustomContent = {
        puAreaKm2: 100,
        puGridShape: PlanningUnitGridShape.Square,
        planningAreaGeom: geom.toJSON().data,
      };

      const [{ relativePath }] = ClonePieceUrisResolver.resolveFor(
        ClonePiece.PlanningAreaCustom,
        'planning area custom file relative path',
      );

      return PrepareZipFile(
        validCustomPlanningAreaFile,
        fileRepository,
        relativePath,
      );
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
        ThenPlanningAreaShouldBeInsertedAndProjectUpdated: async () => {
          await sut.run(input);
          const planningArea = await planningAreaRepo.findOneOrFail({
            where: {
              projectId: input.projectId,
            },
          });

          const [project]: [
            { planning_area_geometry_id: string },
          ] = await entityManager
            .createQueryBuilder()
            .select()
            .from('projects', 'p')
            .where('id = :projectId', { projectId: input.projectId })
            .execute();

          expect(project).toBeDefined();
          expect(project.planning_area_geometry_id).toEqual(planningArea.id);
        },
      };
    },
  };
};
