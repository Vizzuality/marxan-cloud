import { PlanningAreaGadmPieceExporter } from '@marxan-geoprocessing/export/pieces-exporters/planning-area-gadm.piece-exporter';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
import { PlanningAreaGadmContent } from '@marxan/cloning/infrastructure/clone-piece-data/planning-area-gadm';
import {
  CloningFilesRepository,
  CloningFileSRepositoryModule,
} from '@marxan/cloning-files-repository';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getEntityManagerToken, TypeOrmModule } from '@nestjs/typeorm';
import { isLeft, Right } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';
import {
  DeleteProjectAndOrganization,
  GivenProjectExists,
  readSavedFile,
} from '../fixtures';

let fixtures: FixtureType<typeof getFixtures>;

describe(PlanningAreaGadmPieceExporter, () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  }, 10_000);

  afterEach(async () => {
    await fixtures?.cleanUp();
  });

  it('should throw when project is not found', async () => {
    const input = fixtures.GivenAPlanningAreaGadmExportJob();
    await fixtures
      .WhenPieceExporterIsInvoked(input)
      .ThenAProjectExistErrorShouldBeThrown();
  });
  it('should save file succesfully when project is found', async () => {
    const input = fixtures.GivenAPlanningAreaGadmExportJob();
    await fixtures.GivenProjectWithGadmArea();
    await fixtures
      .WhenPieceExporterIsInvoked(input)
      .ThenPlanningAreaGadmFileIsSaved();
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
      CloningFileSRepositoryModule,
    ],
    providers: [
      PlanningAreaGadmPieceExporter,
      { provide: Logger, useValue: { error: () => {}, setContext: () => {} } },
    ],
  }).compile();

  await sandbox.init();
  const projectId = v4();
  const organizationId = v4();
  const sut = sandbox.get(PlanningAreaGadmPieceExporter);
  const apiEntityManager: EntityManager = sandbox.get(
    getEntityManagerToken(geoprocessingConnections.apiDB),
  );
  const fileRepository = sandbox.get(CloningFilesRepository);
  const expectedContent: PlanningAreaGadmContent = {
    l1: 'NAM.12_1',
    l2: 'NAM.12.7_1',
    planningUnitAreakm2: 500,
    bbox: [10, 11, 12, 13],
    country: 'AGO',
  };

  return {
    cleanUp: async () => {
      return DeleteProjectAndOrganization(
        apiEntityManager,
        projectId,
        organizationId,
      );
    },
    GivenAPlanningAreaGadmExportJob: (): ExportJobInput => {
      return {
        allPieces: [
          { resourceId: projectId, piece: ClonePiece.ProjectMetadata },
          { resourceId: projectId, piece: ClonePiece.PlanningAreaGAdm },
        ],
        componentId: v4(),
        exportId: v4(),
        piece: ClonePiece.PlanningAreaGAdm,
        resourceId: projectId,
        resourceKind: ResourceKind.Project,
        isCloning: false,
      };
    },
    GivenProjectWithGadmArea: async () => {
      return GivenProjectExists(apiEntityManager, projectId, organizationId, {
        description: 'desc',
        admin_area_l1_id: 'NAM.12_1',
        admin_area_l2_id: 'NAM.12.7_1',
        planning_unit_area_km2: 500,
        bbox: JSON.stringify([10, 11, 12, 13]),
        country_id: 'AGO',
      });
    },
    WhenPieceExporterIsInvoked: (input: ExportJobInput) => {
      return {
        ThenAProjectExistErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(
            /Gadm data not found for project with ID/gi,
          );
        },
        ThenPlanningAreaGadmFileIsSaved: async () => {
          const result = await sut.run(input);
          const file = await fileRepository.get(result.uris[0].uri);
          expect((file as Right<Readable>).right).toBeDefined();
          if (isLeft(file)) throw new Error();
          const savedStrem = file.right;
          const content = await readSavedFile<PlanningAreaGadmContent>(
            savedStrem,
          );
          expect(content).toEqual(expectedContent);
        },
      };
    },
  };
};
