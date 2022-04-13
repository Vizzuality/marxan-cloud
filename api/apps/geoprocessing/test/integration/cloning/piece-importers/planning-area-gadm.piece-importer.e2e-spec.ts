import { PlanningAreaGadmPieceImporter } from '@marxan-geoprocessing/import/pieces-importers/planning-area-gadm.piece-importer';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ImportJobInput } from '@marxan/cloning';
import {
  ArchiveLocation,
  ClonePiece,
  ResourceKind,
} from '@marxan/cloning/domain';
import { ClonePieceUrisResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import { PlanningAreaGadmContent } from '@marxan/cloning/infrastructure/clone-piece-data/planning-area-gadm';
import { FileRepository, FileRepositoryModule } from '@marxan/files-repository';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getEntityManagerToken, TypeOrmModule } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';
import {
  DeleteProjectAndOrganization,
  GivenProjectExists,
  PrepareZipFile,
} from '../fixtures';

interface ProjectSelectResult {
  country_id: string;
  admin_area_l1_id: string;
  admin_area_l2_id: string;
  planning_unit_grid_shape: string;
  planning_unit_area_km2: string;
  bbox: number[];
}

let fixtures: FixtureType<typeof getFixtures>;

describe(PlanningAreaGadmPieceImporter, () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  }, 10_000);

  afterEach(async () => {
    await fixtures?.cleanUp();
  });

  it('fails when gadm planning area file uri is missing in uris array', async () => {
    const input = fixtures.GivenJobInputWithoutUris();
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenAnUrisArrayErrorShouldBeThrown();
  });

  it('fails when the file cannot be retrieved from file repo', async () => {
    const archiveLocation = fixtures.GivenNoGadmPlanningAreaFileIsAvailable();
    const input = fixtures.GivenJobInput(archiveLocation);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenADataNotAvailableErrorShouldBeThrown();
  });

  it('imports project gadm planning area', async () => {
    await fixtures.GivenProject();
    const archiveLocation = await fixtures.GivenValidGadmPlanningAreaFile();
    const input = fixtures.GivenJobInput(archiveLocation);
    await fixtures
      .WhenPieceImporterIsInvoked(input)
      .ThenProjectShouldBeUpdated();
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
      FileRepositoryModule,
    ],
    providers: [
      PlanningAreaGadmPieceImporter,
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
  const sut = sandbox.get(PlanningAreaGadmPieceImporter);
  const fileRepository = sandbox.get(FileRepository);

  const validGadmPlanningAreaFile: PlanningAreaGadmContent = {
    country: 'AGO',
    bbox: [10, 11, 12, 13],
    l1: 'AGO.13_1',
    l2: 'AGO.13.2_1',
    planningUnitAreakm2: 100,
  };

  return {
    cleanUp: async () => {
      await DeleteProjectAndOrganization(
        entityManager,
        projectId,
        organizationId,
      );
    },
    GivenProject: () => {
      return GivenProjectExists(entityManager, projectId, organizationId);
    },
    GivenJobInput: (archiveLocation: ArchiveLocation): ImportJobInput => {
      const [uri] = ClonePieceUrisResolver.resolveFor(
        ClonePiece.PlanningAreaGAdm,
        archiveLocation.value,
      );
      return {
        componentId: v4(),
        pieceResourceId: v4(),
        importId: v4(),
        projectId,
        piece: ClonePiece.PlanningAreaGAdm,
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
        piece: ClonePiece.PlanningAreaGAdm,
        resourceKind: ResourceKind.Project,
        uris: [],
        ownerId: userId,
      };
    },
    GivenNoGadmPlanningAreaFileIsAvailable: () => {
      return new ArchiveLocation('not found');
    },
    GivenValidGadmPlanningAreaFile: async () => {
      const [{ relativePath }] = ClonePieceUrisResolver.resolveFor(
        ClonePiece.PlanningAreaGAdm,
        'planning area gadm file relative path',
      );

      return PrepareZipFile(
        validGadmPlanningAreaFile,
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
        ThenProjectShouldBeUpdated: async () => {
          await sut.run(input);
          const [project]: [
            ProjectSelectResult,
          ] = await entityManager
            .createQueryBuilder()
            .select()
            .from('projects', 'p')
            .where('id = :projectId', { projectId: input.projectId })
            .execute();

          expect(project).toBeDefined();
          expect(project.admin_area_l1_id).toEqual(
            validGadmPlanningAreaFile.l1,
          );
          expect(project.admin_area_l2_id).toEqual(
            validGadmPlanningAreaFile.l2,
          );
          expect(project.bbox).toEqual(validGadmPlanningAreaFile.bbox);
          expect(project.country_id).toEqual(validGadmPlanningAreaFile.country);
          expect(project.planning_unit_area_km2).toEqual(
            validGadmPlanningAreaFile.planningUnitAreakm2,
          );
        },
      };
    },
  };
};
