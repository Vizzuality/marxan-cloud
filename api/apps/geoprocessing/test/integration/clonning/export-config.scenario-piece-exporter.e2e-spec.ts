import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
import { FileRepository, FileRepositoryModule } from '@marxan/files-repository';
import { PlanningUnitGridShape } from '@marxan/scenarios-planning-unit';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getEntityManagerToken, TypeOrmModule } from '@nestjs/typeorm';
import { Transform } from 'stream';
import { isLeft, Right } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';
import {
  exportVersion,
  ScenarioExportConfigContent,
} from '@marxan/cloning/infrastructure/clone-piece-data/export-config';
import { ExportConfigScenarioPieceExporter } from '@marxan-geoprocessing/export/pieces-exporters/export-config.scenario-piece-exporter';

let fixtures: FixtureType<typeof getFixtures>;

describe(ExportConfigScenarioPieceExporter, () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  }, 10_000);

  afterEach(async () => {
    await fixtures?.cleanUp();
  });

  it('should throw when scenario is not found ', async () => {
    const input = fixtures.GivenAExportConfigScenarioExportJob();
    await fixtures
      .WhenPieceExporterIsInvoked(input)
      .ThenASceanarioExistErrorShouldBeThrown();
  });
  it('should save file succesfully when scenario is found', async () => {
    const input = fixtures.GivenAExportConfigScenarioExportJob();
    await fixtures.GivenScenarioExist();
    await fixtures
      .WhenPieceExporterIsInvoked(input)
      .ThenExportConfigScenarioFileIsSaved();
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
      ExportConfigScenarioPieceExporter,
      { provide: Logger, useValue: { error: () => {}, setContext: () => {} } },
    ],
  }).compile();

  await sandbox.init();
  const projectId = v4();
  const scenarioId = v4();
  const organizationId = v4();
  const sut = sandbox.get(ExportConfigScenarioPieceExporter);
  const apiEntityManager: EntityManager = sandbox.get(
    getEntityManagerToken(geoprocessingConnections.apiDB),
  );
  const fileRepository = sandbox.get(FileRepository);
  const expectedContent: ScenarioExportConfigContent = {
    name: 'scenario1',
    description: 'desc',
    version: exportVersion,
    projectId,
    resourceKind: ResourceKind.Scenario,
    resourceId: scenarioId,
    pieces: [ClonePiece.ScenarioMetadata, ClonePiece.ExportConfig],
  };

  const readSavedFile = async (
    savedStrem: Readable,
  ): Promise<ScenarioExportConfigContent> => {
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
    },
    GivenAExportConfigScenarioExportJob: (): ExportJobInput => {
      return {
        allPieces: [
          { resourceId: scenarioId, piece: ClonePiece.ScenarioMetadata },
          { resourceId: scenarioId, piece: ClonePiece.ExportConfig },
        ],
        componentId: v4(),
        exportId: v4(),
        piece: ClonePiece.ExportConfig,
        resourceId: scenarioId,
        resourceKind: ResourceKind.Scenario,
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
          project_id: projectId,
        })
        .execute();
    },
    WhenPieceExporterIsInvoked: (input: ExportJobInput) => {
      return {
        ThenASceanarioExistErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(/Scenario with ID/gi);
        },
        ThenExportConfigScenarioFileIsSaved: async () => {
          const result = await sut.run(input);
          const file = await fileRepository.get(result.uris[0].uri);
          expect((file as Right<Readable>).right).toBeDefined();
          if (isLeft(file)) throw new Error();
          const savedStrem = file.right;
          const content = await readSavedFile(savedStrem);
          expect(content).toEqual(expectedContent);
        },
      };
    },
  };
};
