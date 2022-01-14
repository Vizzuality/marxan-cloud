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
import { ExportComponentEntity } from '@marxan-api/modules/clone/export/adapters/entities/export-components.api.entity';
import { ComponentLocationEntity } from '@marxan-api/modules/clone/export/adapters/entities/component-locations.api.entity';

describe('Typeorm export repository', () => {
  let fixtures: FixtureType<typeof getFixtures>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  }, 20000);

  afterAll(async () => {
    await fixtures.cleanup();
  });

  it('should expose methods for getting an export by id and storing exports', async () => {
    await fixtures.WhenAnExportIsSavedSuccessfully();

    const exportData = await fixtures.WhenReadingTheSavedExportFromRepository();

    await fixtures.ThenExportDataShouldBeOk({
      exportData,
      componentsAreCompleted: false,
    });
  });

  it('should update an export when a nested piece is completed', async () => {
    await fixtures.WhenAnExportIsSavedSuccessfully();
    await fixtures.WhenAComponentIsCompleted();
    const exportData = await fixtures.WhenReadingTheSavedExportFromRepository();

    await fixtures.ThenExportDataShouldBeOk({
      exportData,
      componentsAreCompleted: true,
    });
  });

  it('should save entities working with transaction', async () => {
    await fixtures.WhenAnExportIsSavedSuccessfullyWithinATransaction();
    await fixtures.WhenAllComponentsAreCompletedWithTransactions();

    const exportData = await fixtures.WhenReadingTheSavedExportFromRepository();

    fixtures.ThenAllExportComponentsShouldBeFinished({
      exportData,
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
      const exportComponentRepo = connection.getRepository(
        ExportComponentEntity,
      );
      const locationRepo = connection.getRepository(ComponentLocationEntity);

      await locationRepo.delete({});
      await exportComponentRepo.delete({});
      await exportRepo.delete({});
      await app.close();
    },
    WhenAnExportIsSavedSuccessfully: async () => {
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
    WhenAnExportIsSavedSuccessfullyWithinATransaction: async () => {
      resourceId = new ResourceId(v4());

      componentLocationUri = `/foo/bar/project-metadata.json`;
      componentLocationRelativePath = `project-metadata.json`;

      const components = Array(10).map(() => ({
        finished: false,
        piece: ClonePiece.ProjectMetadata,
        resourceId: resourceId.value,
        id: new ComponentId(v4()),
        uris: [
          new ComponentLocation(
            componentLocationUri,
            componentLocationRelativePath,
          ),
        ],
      }));

      const exportInstance = Export.newOne(
        resourceId,
        ResourceKind.Project,
        components,
      );
      exportId = exportInstance.id;
      await repo.transaction(async (repository) => {
        await repository.save(exportInstance);
      });
    },
    WhenAComponentIsCompleted: async () => {
      const componentLocation = new ComponentLocation(
        componentLocationUri,
        componentLocationRelativePath,
      );
      const exportInstance = (await repo.find(exportId)) as Export;
      expect(exportInstance).toBeDefined();

      exportInstance.completeComponent(componentId, [componentLocation]);
      await repo.save(exportInstance);
    },
    WhenAllComponentsAreCompletedWithTransactions: async () => {
      const componentLocation = new ComponentLocation(
        componentLocationUri,
        componentLocationRelativePath,
      );
      const exportInstance = (await repo.find(exportId)) as Export;
      expect(exportInstance).toBeDefined();

      await Promise.all(
        exportInstance.toSnapshot().exportPieces.map((piece) =>
          repo.transaction(async (repository) => {
            exportInstance.completeComponent(piece.id, [componentLocation]);
            await repository.save(exportInstance);
          }),
        ),
      );
    },
    WhenReadingTheSavedExportFromRepository: async () => {
      return await repo.find(exportId);
    },
    ThenExportDataShouldBeOk: async ({
      exportData,
      componentsAreCompleted,
    }: {
      exportData: Export | undefined;
      componentsAreCompleted: boolean;
    }) => {
      expect(exportData).toBeDefined();
      expect(exportData!.id.value).toBe(exportId.value);
      expect(exportData!.resourceKind).toBe(ResourceKind.Project);
      expect(exportData!.resourceId.value).toBe(resourceId.value);

      const exportSnapshot = exportData!.toSnapshot();

      expect(exportSnapshot.exportPieces).toHaveLength(1);

      const [exportComponent] = exportSnapshot.exportPieces;

      expect(exportComponent.finished).toBe(componentsAreCompleted);
      expect(exportComponent.piece).toBe(ClonePiece.ProjectMetadata);
      expect(exportComponent.resourceId).toBe(resourceId.value);

      if (componentsAreCompleted) {
        expect(exportComponent.uris).toBeDefined();
        expect(exportComponent.uris.length).toBeGreaterThan(0);

        exportComponent.uris.forEach((el) => {
          expect(el.uri).toEqual(componentLocationUri);
          expect(el.relativePath).toEqual(componentLocationRelativePath);
        });
      }
    },
    ThenAllExportComponentsShouldBeFinished: ({
      exportData,
    }: {
      exportData: Export | undefined;
    }) => {
      expect(exportData).toBeDefined();
      exportData!.toSnapshot().exportPieces.map((piece) => {
        expect(piece.finished).toEqual(true);
      });
    },
  };
};
