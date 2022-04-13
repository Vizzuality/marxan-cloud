import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
import { FileRepository, FileRepositoryModule } from '@marxan/files-repository';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getEntityManagerToken, TypeOrmModule } from '@nestjs/typeorm';
import { isLeft, Right } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { EntityManager, In, Repository } from 'typeorm';
import { v4 } from 'uuid';
import { ProjectCustomProtectedAreasPieceExporter } from '@marxan-geoprocessing/export/pieces-exporters/project-custom-protected-areas.piece-exporter';
import { ProtectedArea } from '@marxan/protected-areas';
import { ProjectCustomProtectedAreasContent } from '@marxan/cloning/infrastructure/clone-piece-data/project-custom-protected-areas';
import {
  DeleteProjectAndOrganization,
  DeleteProtectedAreas,
  GivenCustomProtectedAreas,
  GivenProjectExists,
  readSavedFile,
} from './fixtures';

let fixtures: FixtureType<typeof getFixtures>;

describe(ProjectCustomProtectedAreasPieceExporter, () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  }, 10_000);

  afterEach(async () => {
    await fixtures?.cleanUp();
  });

  it('should save empty file when there are not any project custom protected areas', async () => {
    const input = fixtures.GivenAProjectCustomProtectedAreasExportJob();
    await fixtures.GivenProjectExist();
    await fixtures.GivenNoCustomProtectedAreaForProject();
    await fixtures
      .WhenPieceExporterIsInvoked(input)
      .ThenAnEmptyProjectCustomProtectedAreasFileIsSaved();
  });
  it('should save file succesfully when there are project custom protected areas', async () => {
    const input = fixtures.GivenAProjectCustomProtectedAreasExportJob();
    await fixtures.GivenProjectExist();
    await fixtures.GivenCustomProtectedAreaForProject();
    await fixtures
      .WhenPieceExporterIsInvoked(input)
      .ThenAProjectCustomProtectedAreasFileIsSaved();
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
      TypeOrmModule.forRoot({
        ...geoprocessingConnections.default,
        keepConnectionAlive: true,
        logging: false,
      }),
      TypeOrmModule.forFeature([ProtectedArea]),
      FileRepositoryModule,
    ],
    providers: [
      ProjectCustomProtectedAreasPieceExporter,
      { provide: Logger, useValue: { error: () => {}, setContext: () => {} } },
    ],
  }).compile();

  await sandbox.init();
  const projectId = v4();
  const otherProjectId = v4();
  let projectPlanningAreaId: string;
  let otherProjectPlanningAreaId: string;
  const organizationId = v4();
  const sut = sandbox.get(ProjectCustomProtectedAreasPieceExporter);
  const apiEntityManager: EntityManager = sandbox.get(
    getEntityManagerToken(geoprocessingConnections.apiDB),
  );
  const geoEntityManager: EntityManager = sandbox.get(
    getEntityManagerToken(geoprocessingConnections.default),
  );
  const fileRepository = sandbox.get(FileRepository);

  return {
    cleanUp: async () => {
      await DeleteProjectAndOrganization(
        apiEntityManager,
        projectId,
        organizationId,
      );
      return DeleteProtectedAreas(geoEntityManager, [
        projectPlanningAreaId,
        otherProjectPlanningAreaId,
      ]);
    },
    GivenAProjectCustomProtectedAreasExportJob: (): ExportJobInput => {
      return {
        allPieces: [
          { resourceId: projectId, piece: ClonePiece.ProjectMetadata },
          {
            resourceId: projectId,
            piece: ClonePiece.ProjectCustomProtectedAreas,
          },
        ],
        componentId: v4(),
        exportId: v4(),
        piece: ClonePiece.ProjectMetadata,
        resourceId: projectId,
        resourceKind: ResourceKind.Project,
        isCloning: false,
      };
    },
    GivenProjectExist: async () => {
      return GivenProjectExists(apiEntityManager, projectId, organizationId, {
        description: 'desc',
        planning_unit_area_km2: 500,
      });
    },
    GivenNoCustomProtectedAreaForProject: async () => {
      otherProjectPlanningAreaId = (
        await GivenCustomProtectedAreas(geoEntityManager, 1, otherProjectId)
      )[0].id;
    },
    GivenCustomProtectedAreaForProject: async () => {
      projectPlanningAreaId = (
        await GivenCustomProtectedAreas(geoEntityManager, 1, projectId)
      )[0].id;
    },
    WhenPieceExporterIsInvoked: (input: ExportJobInput) => {
      return {
        ThenAnEmptyProjectCustomProtectedAreasFileIsSaved: async () => {
          const result = await sut.run(input);
          const file = await fileRepository.get(result.uris[0].uri);
          expect((file as Right<Readable>).right).toBeDefined();
          if (isLeft(file)) throw new Error();
          const savedStrem = file.right;
          const content = await readSavedFile(savedStrem);
          expect(content).toEqual([]);
        },
        ThenAProjectCustomProtectedAreasFileIsSaved: async () => {
          const result = await sut.run(input);
          const file = await fileRepository.get(result.uris[0].uri);
          expect((file as Right<Readable>).right).toBeDefined();
          if (isLeft(file)) throw new Error();
          const savedStrem = file.right;
          const content = (
            await readSavedFile<ProjectCustomProtectedAreasContent[]>(
              savedStrem,
            )
          )[0];
          expect(content.fullName).toBe(
            `custom protected area 1 of ${projectId}`,
          );
          expect(content.ewkb.length).toBeGreaterThan(0);
        },
      };
    },
  };
};
