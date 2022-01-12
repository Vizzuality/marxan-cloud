import { ClonePiece, ComponentId, ResourceKind } from '@marxan/cloning/domain';
import { Connection } from 'typeorm';
import { v4 } from 'uuid';
import { ResourceId } from '../../src/modules/clone/export';
import { ExportEntity } from '../../src/modules/clone/export/adapters/entities/exports.api.entity';
import { ComponentLocation } from '../../src/modules/clone/export/application/complete-piece.command';
import { ExportRepository } from '../../src/modules/clone/export/application/export-repository.port';
import { Export, ExportId } from '../../src/modules/clone/export/domain';
import { bootstrapApplication } from '../utils/api-application';
import { FixtureType } from '@marxan/utils/tests/fixture-type';

describe('Typeorm export repository', () => {
  let fixtures: FixtureType<typeof getFixtures>;
  let repo: ExportRepository;

  beforeEach(async () => {
    fixtures = await getFixtures();
  }, 100000);

  afterAll(async () => {
    await fixtures.cleanup();
  });

  it('should expose methods for getting an export by id and storing exports', async () => {
    await fixtures.WhenSavingAnExportItShouldNotFail();

    await fixtures.ThenWhenReadingItFromRepositoryExportDataShouldBeOk({
      componentIsCompleted: false,
    });
  });

  it('should update nested entities', async () => {
    await fixtures.WhenSavingAnExportItShouldNotFail();
    await fixtures.ThenWhenCompletingAComponent();
    await fixtures.ThenWhenReadingItFromRepositoryExportDataShouldBeOk({
      componentIsCompleted: true,
    });
  });
});

const getFixtures = async () => {
  let exportId: ExportId;
  let resourceId: ResourceId;
  let componentId: ComponentId;
  let componentLocationUri: string;
  let componentLocationRelativePath: string;

  const app = await bootstrapApplication();
  const repo = app.get<ExportRepository>(ExportRepository);

  return {
    cleanup: async () => {
      const connection = app.get<Connection>(Connection);
      const exportRepo = connection.getRepository(ExportEntity);

      await exportRepo.delete({});
      await app.close();
    },
    WhenSavingAnExportItShouldNotFail: async () => {
      resourceId = new ResourceId(v4());
      componentId = new ComponentId(v4());
      componentLocationUri = '/foo/bar/project-metadata.json';
      componentLocationRelativePath = 'project-metadata.json';
      const exportInstance = Export.newOne(resourceId, ResourceKind.Project, [
        {
          finished: false,
          piece: ClonePiece.ProjectMetadata,
          resourceId: resourceId.value,
          id: componentId,
          uris: [
            new ComponentLocation(
              componentLocationUri,
              componentLocationRelativePath,
            ),
          ],
        },
      ]);
      exportId = exportInstance.id;
      await repo.save(exportInstance);
    },
    ThenWhenCompletingAComponent: async () => {
      const componentLocation = new ComponentLocation(
        componentLocationUri,
        componentLocationRelativePath,
      );
      const exportInstance = (await repo.find(exportId)) as Export;
      expect(exportInstance).toBeDefined();

      exportInstance.completeComponent(componentId, [componentLocation]);
      await repo.save(exportInstance);
    },
    ThenWhenReadingItFromRepositoryExportDataShouldBeOk: async ({
      componentIsCompleted,
    }: {
      componentIsCompleted: boolean;
    }) => {
      const result = (await repo.find(exportId)) as Export;

      expect(result).toBeDefined();
      expect(result.id.value).toBe(exportId.value);
      expect(result.resourceKind).toBe(ResourceKind.Project);
      expect(result.resourceId.value).toBe(resourceId.value);

      const resultSnapshot = result.toSnapshot();

      expect(resultSnapshot.exportPieces).toHaveLength(1);

      const [exportComponent] = resultSnapshot.exportPieces;

      expect(exportComponent.finished).toBe(componentIsCompleted);
      expect(exportComponent.piece).toBe(ClonePiece.ProjectMetadata);
      expect(exportComponent.resourceId).toBe(resourceId.value);

      if (componentIsCompleted) {
        expect(exportComponent.uris).toBeDefined();
        expect(exportComponent.uris).toHaveLength(1);
        expect(exportComponent.uris[0].uri).toBe(componentLocationUri);
        expect(exportComponent.uris[0].relativePath).toBe(
          componentLocationRelativePath,
        );
      }
    },
  };
};
