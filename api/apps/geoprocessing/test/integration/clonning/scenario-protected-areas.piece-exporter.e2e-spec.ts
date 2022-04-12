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
import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';
import { MultiPolygon } from 'geojson';
import { ProtectedArea } from '@marxan/protected-areas';
import { ScenarioProtectedAreasPieceExporter } from '@marxan-geoprocessing/export/pieces-exporters/scenario-protected-areas.piece-exporter';
import { ScenarioProtectedAreasContent } from '@marxan/cloning/infrastructure/clone-piece-data/scenario-protected-areas';
import {
  DeleteProjectAndOrganization,
  DeleteProtectedAreas,
  GivenCustomProtectedAreas,
  GivenScenarioExists,
  GivenWdpaProtectedAreas,
  readSavedFile,
} from './fixtures';

let fixtures: FixtureType<typeof getFixtures>;

describe(ScenarioProtectedAreasPieceExporter, () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  }, 10_000);

  afterEach(async () => {
    await fixtures?.cleanUp();
  });

  it('should throw when the scenario is not found', async () => {
    const input = fixtures.GivenAScenarioProtectedAreasExportJob();
    await fixtures
      .WhenPieceExporterIsInvoked(input)
      .ThenASceanarioExistErrorShouldBeThrown();
  });
  it('should save empty file when no protected areas are selected', async () => {
    const input = fixtures.GivenAScenarioProtectedAreasExportJob();
    await fixtures.GivenScenarioExist();
    await fixtures.GivenNoSelectedAreasForScenario();
    await fixtures
      .WhenPieceExporterIsInvoked(input)
      .ThenAnEmptyScenarioProtectedAreasFileIsSaved();
  });
  it('should save file succesfully when protected areas are selected', async () => {
    const input = fixtures.GivenAScenarioProtectedAreasExportJob();
    await fixtures.GivenScenarioExist();
    await fixtures.GivenSelectedAreasForScenario();
    await fixtures
      .WhenPieceExporterIsInvoked(input)
      .ThenAScenarioProtectedAreasFileIsSaved();
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
      ScenarioProtectedAreasPieceExporter,
      { provide: Logger, useValue: { error: () => {}, setContext: () => {} } },
    ],
  }).compile();

  await sandbox.init();
  const projectId = v4();
  const scenarioId = v4();
  let customProtectedAreaId: string = v4();
  let commonProtectedAreasWdpaids: number[] = [];
  let commonProtectedAreasIds: string[] = [];
  const organizationId = v4();
  const sut = sandbox.get(ScenarioProtectedAreasPieceExporter);
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
        customProtectedAreaId,
        ...commonProtectedAreasIds,
      ]);
    },
    GivenAScenarioProtectedAreasExportJob: (): ExportJobInput => {
      return {
        allPieces: [
          { resourceId: projectId, piece: ClonePiece.ProjectMetadata },
          {
            resourceId: projectId,
            piece: ClonePiece.ScenarioProtectedAreas,
          },
        ],
        componentId: v4(),
        exportId: v4(),
        piece: ClonePiece.ScenarioProtectedAreas,
        resourceId: scenarioId,
        resourceKind: ResourceKind.Project,
        isCloning: false,
      };
    },
    GivenScenarioExist: async () => {
      return GivenScenarioExists(
        apiEntityManager,
        scenarioId,
        projectId,
        organizationId,
      );
    },
    GivenNoSelectedAreasForScenario: async (): Promise<void> => {},
    GivenSelectedAreasForScenario: async () => {
      customProtectedAreaId = (
        await GivenCustomProtectedAreas(geoEntityManager, 1, projectId)
      )[0].id;

      const commonProtectedAreas = await GivenWdpaProtectedAreas(
        geoEntityManager,
        3,
      );
      commonProtectedAreas.forEach((protectedArea) => {
        commonProtectedAreasIds.push(protectedArea.id);
        commonProtectedAreasWdpaids.push(protectedArea.wdpaId);
      });

      return apiEntityManager
        .createQueryBuilder()
        .update('scenarios')
        .set({
          protected_area_filter_by_ids: JSON.stringify([
            ...commonProtectedAreasIds,
            customProtectedAreaId,
          ]),
          wdpa_threshold: 1,
        })
        .where('id = :scenarioId', { scenarioId })
        .execute();
    },
    WhenPieceExporterIsInvoked: (input: ExportJobInput) => {
      return {
        ThenASceanarioExistErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(/does not exist/gi);
        },
        ThenAnEmptyScenarioProtectedAreasFileIsSaved: async () => {
          const result = await sut.run(input);
          const file = await fileRepository.get(result.uris[0].uri);
          expect((file as Right<Readable>).right).toBeDefined();
          if (isLeft(file)) throw new Error();
          const savedStrem = file.right;
          const content = await readSavedFile<ScenarioProtectedAreasContent>(
            savedStrem,
          );
          expect(content).toEqual({
            wdpa: [],
            customProtectedAreas: [],
            threshold: null,
          });
        },
        ThenAScenarioProtectedAreasFileIsSaved: async () => {
          const result = await sut.run(input);
          const file = await fileRepository.get(result.uris[0].uri);
          expect((file as Right<Readable>).right).toBeDefined();
          if (isLeft(file)) throw new Error();
          const savedStrem = file.right;
          const content = await readSavedFile<ScenarioProtectedAreasContent>(
            savedStrem,
          );
          expect(content.threshold).toBe(1);
          expect(content.wdpa.sort()).toEqual(
            commonProtectedAreasWdpaids.sort(),
          );
          expect(content.customProtectedAreas).toHaveLength(1);
          expect(content.customProtectedAreas[0].name).toBe(
            `custom protected area 1 of ${projectId}`,
          );
          expect(content.customProtectedAreas[0].geom.length).toBeGreaterThan(
            0,
          );
        },
      };
    },
  };
};

const expectedGeom: MultiPolygon = {
  type: 'MultiPolygon',
  coordinates: [
    [
      [
        [102.0, 2.0],
        [103.0, 2.0],
        [103.0, 3.0],
        [102.0, 3.0],
        [102.0, 2.0],
      ],
    ],
    [
      [
        [100.0, 0.0],
        [101.0, 0.0],
        [101.0, 1.0],
        [100.0, 1.0],
        [100.0, 0.0],
      ],
      [
        [100.2, 0.2],
        [100.8, 0.2],
        [100.8, 0.8],
        [100.2, 0.8],
        [100.2, 0.2],
      ],
    ],
  ],
};
