import { ProjectMetadataPieceExporter } from '@marxan-geoprocessing/export/pieces-exporters/project-metadata.piece-exporter';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import { PlanningUnitGridShape } from '@marxan/scenarios-planning-unit';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Test } from '@nestjs/testing';
import { getEntityManagerToken, TypeOrmModule } from '@nestjs/typeorm';
import { isLeft, Right } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';
import { ProjectMetadataContent } from '@marxan/cloning/infrastructure/clone-piece-data/project-metadata';
import {
  DeleteProjectAndOrganization,
  GivenProjectExists,
  readSavedFile,
} from '../fixtures';
import { GeoCloningFilesRepositoryModule } from '@marxan-geoprocessing/modules/cloning-files-repository';
import { ProjectSourcesEnum } from '@marxan/projects';
import { FakeLogger } from '@marxan-api/utils/__mocks__/fake-logger';

let fixtures: FixtureType<typeof getFixtures>;

describe(ProjectMetadataPieceExporter, () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  }, 10_000);

  afterEach(async () => {
    await fixtures?.cleanUp();
  });

  it('fails when project is not found', async () => {
    const input = fixtures.GivenAProjectMetadataExportJob();
    await fixtures
      .WhenPieceExporterIsInvoked(input)
      .ThenAProjectExistErrorShouldBeThrown();
  });

  it('fails when project blm range is not found', async () => {
    await fixtures.GivenProjectExist(ProjectSourcesEnum.marxanCloud);
    const input = fixtures.GivenAProjectMetadataExportJob();
    await fixtures
      .WhenPieceExporterIsInvoked(input)
      .ThenAProjectBlmExistErrorShouldBeThrown();
  });

  it('saves file succesfully when marxan project is found', async () => {
    const marxanSource = ProjectSourcesEnum.marxanCloud;
    const input = fixtures.GivenAProjectMetadataExportJob();
    await fixtures.GivenProjectExist(marxanSource);
    await fixtures.GivenProjectBlmRangeExist();
    await fixtures
      .WhenPieceExporterIsInvoked(input)
      .ThenProjectMetadataFileIsSaved(marxanSource);
  });

  it('saves file succesfully when legacy project is found', async () => {
    const legacySource = ProjectSourcesEnum.legacyImport;
    const input = fixtures.GivenAProjectMetadataExportJob();
    await fixtures.GivenProjectExist(legacySource);
    await fixtures.GivenProjectBlmRangeExist();
    await fixtures
      .WhenPieceExporterIsInvoked(input)
      .ThenProjectMetadataFileIsSaved(legacySource);
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
      GeoCloningFilesRepositoryModule,
    ],
    providers: [ProjectMetadataPieceExporter],
  }).compile();

  await sandbox.init();
  sandbox.useLogger(new FakeLogger());

  const projectId = v4();
  const organizationId = v4();
  const sut = sandbox.get(ProjectMetadataPieceExporter);
  const apiEntityManager: EntityManager = sandbox.get(
    getEntityManagerToken(geoprocessingConnections.apiDB),
  );
  const fileRepository = sandbox.get(CloningFilesRepository);
  const metadata = { foo: 'bar' };

  const expectedContent: (
    sources: ProjectSourcesEnum,
  ) => ProjectMetadataContent = (sources: ProjectSourcesEnum) => ({
    name: `test project - ${projectId}`,
    planningUnitGridShape: PlanningUnitGridShape.Square,
    blmRange: {
      defaults: [0, 20, 40, 60, 80, 100],
      range: [0, 100],
      values: [],
    },
    metadata,
    sources,
  });

  return {
    cleanUp: async () => {
      return DeleteProjectAndOrganization(
        apiEntityManager,
        projectId,
        organizationId,
      );
    },
    GivenAProjectMetadataExportJob: (): ExportJobInput => {
      return {
        allPieces: [
          { resourceId: projectId, piece: ClonePiece.ProjectMetadata },
        ],
        componentId: v4(),
        exportId: v4(),
        piece: ClonePiece.ProjectMetadata,
        resourceId: projectId,
        resourceKind: ResourceKind.Project,
      };
    },
    GivenProjectExist: async (sources: ProjectSourcesEnum) => {
      return GivenProjectExists(apiEntityManager, projectId, organizationId, {
        metadata,
        sources,
      });
    },
    GivenProjectBlmRangeExist: async () => {
      return apiEntityManager
        .createQueryBuilder()
        .insert()
        .into('project_blms')
        .values({
          id: projectId,
          values: [],
          defaults: [0, 20, 40, 60, 80, 100],
          range: [0, 100],
        })
        .execute();
    },
    WhenPieceExporterIsInvoked: (input: ExportJobInput) => {
      return {
        ThenAProjectExistErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(/does not exist/gi);
        },
        ThenAProjectBlmExistErrorShouldBeThrown: async () => {
          await expect(sut.run(input)).rejects.toThrow(/blm.*does not exist/gi);
        },
        ThenProjectMetadataFileIsSaved: async (sources: ProjectSourcesEnum) => {
          const result = await sut.run(input);
          const file = await fileRepository.get(result.uris[0].uri);
          expect((file as Right<Readable>).right).toBeDefined();
          if (isLeft(file)) throw new Error();
          const savedStrem = file.right;
          const content = await readSavedFile<ProjectMetadataContent>(
            savedStrem,
          );
          expect(content).toMatchObject(expectedContent(sources));
        },
      };
    },
  };
};
