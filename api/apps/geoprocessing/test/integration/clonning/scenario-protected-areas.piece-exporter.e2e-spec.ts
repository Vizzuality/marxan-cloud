import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
import { FileRepository, FileRepositoryModule } from '@marxan/files-repository';
import { PlanningUnitGridShape } from '@marxan/scenarios-planning-unit';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {
  getEntityManagerToken,
  getRepositoryToken,
  TypeOrmModule,
} from '@nestjs/typeorm';
import { Transform } from 'stream';
import { isLeft, Right } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { EntityManager, In, Repository } from 'typeorm';
import { v4 } from 'uuid';
import { MultiPolygon } from 'geojson';
import { ProtectedArea } from '@marxan/protected-areas';
import { ScenarioProtectedAreasPieceExporter } from '@marxan-geoprocessing/export/pieces-exporters/scenario-protected-areas.piece-exporter';
import { ScenarioProtectedAreasContent } from '@marxan/cloning/infrastructure/clone-piece-data/scenario-protected-areas';

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
  it('should save file succesfully when protected areas are selecteds', async () => {
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
  const commonProtectedAreasWdpaids = [1089, 27037, 4088];
  let commonProtectedAreasIds: string[];
  const customProtectedAreaId = v4();
  const organizationId = v4();
  const sut = sandbox.get(ScenarioProtectedAreasPieceExporter);
  const apiEntityManager: EntityManager = sandbox.get(
    getEntityManagerToken(geoprocessingConnections.apiDB),
  );
  const fileRepository = sandbox.get(FileRepository);
  const protectedAreasRepository: Repository<ProtectedArea> = sandbox.get(
    getRepositoryToken(ProtectedArea),
  );
  const readSavedFile = async (
    savedStrem: Readable,
  ): Promise<ScenarioProtectedAreasContent> => {
    let buffer: Buffer;
    const transformer = new Transform({
      transform: (chunk) => {
        buffer = chunk;
      },
    });
    await new Promise<void>((resolve) => {
      savedStrem.on('close', () => {
        resolve();
      });
      savedStrem.on('finish', () => {
        resolve();
      });
      savedStrem.pipe(transformer);
    });
    return JSON.parse(buffer!.toString());
  };

  return {
    cleanUp: async () => {
      await apiEntityManager
        .createQueryBuilder()
        .delete()
        .from('projects')
        .where('id = :projectId', { projectId })
        .execute();
      await apiEntityManager
        .createQueryBuilder()
        .delete()
        .from('organizations')
        .where('id = :organizationId', { organizationId })
        .execute();
      await protectedAreasRepository.delete({
        projectId: In([projectId]),
      });
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
      };
    },
    GivenScenarioExist: async (): Promise<void> => {
      await apiEntityManager
        .createQueryBuilder()
        .insert()
        .into('organizations')
        .values({ id: organizationId, name: 'org1' })
        .execute();

      await apiEntityManager
        .createQueryBuilder()
        .insert()
        .into('projects')
        .values({
          id: projectId,
          name: 'name',
          description: 'desc',
          planning_unit_grid_shape: PlanningUnitGridShape.Square,
          organization_id: organizationId,
        })
        .execute();
      await apiEntityManager
        .createQueryBuilder()
        .insert()
        .into('scenarios')
        .values({
          id: scenarioId,
          name: 'scenario1',
          description: 'desc',
          blm: 1,
          number_of_runs: 6,
          project_id: projectId,
          metadata: { marxanInputParameterFile: { meta: '1' } },
        })
        .execute();
    },
    GivenNoSelectedAreasForScenario: async (): Promise<void> => {},
    GivenSelectedAreasForScenario: async (): Promise<void> => {
      await protectedAreasRepository.save({
        id: customProtectedAreaId,
        projectId,
        fullName: 'custom1',
        theGeom: expectedGeom,
      });
      const commonProtectedAreas = await protectedAreasRepository.find({
        wdpaId: In(commonProtectedAreasWdpaids),
      });
      commonProtectedAreasIds = commonProtectedAreas.map(
        (protectedArea) => protectedArea.id,
      );
      await apiEntityManager
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
          const content = await readSavedFile(savedStrem);
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
          const content = await readSavedFile(savedStrem);
          expect(content.threshold).toBe(1);
          expect(content.wdpa.sort()).toEqual(
            commonProtectedAreasWdpaids.sort(),
          );
          expect(content.customProtectedAreas).toHaveLength(1);
          expect(content.customProtectedAreas[0].name).toBe('custom1');
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
