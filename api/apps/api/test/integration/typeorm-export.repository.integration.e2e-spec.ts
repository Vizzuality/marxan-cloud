import { ExportRepository } from '@marxan-api/modules/clone/export/application/export-repository.port';
import {
  Export,
  ExportComponent,
  ExportId,
  ExportSnapshot,
} from '@marxan-api/modules/clone/export/domain';
import { ImportRepository } from '@marxan-api/modules/clone/import/application/import.repository.port';
import { Import, ImportId } from '@marxan-api/modules/clone/import/domain';
import {
  ArchiveLocation,
  ClonePiece,
  ComponentId,
  ComponentLocation,
  ResourceId,
  ResourceKind,
} from '@marxan/cloning/domain';
import { UserId } from '@marxan/domain-ids';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { v4 } from 'uuid';
import { GivenUserExists } from '../steps/given-user-exists';
import { bootstrapApplication } from '../utils/api-application';

const millisecondsInADay = 24 * 60 * 60 * 1000;

describe('Typeorm export repository', () => {
  let fixtures: FixtureType<typeof getFixtures>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  }, 20000);

  it('should expose methods for getting an export by id and storing exports', async () => {
    await fixtures.GivenExportWasRequested();

    const exportData = await fixtures.WhenReadingTheSavedExportFromRepository();

    await fixtures.ThenExportDataShouldBeOk({
      exportData,
      componentsAreCompleted: false,
    });
  });

  it('should update an export when a nested piece is completed', async () => {
    await fixtures.GivenExportWasRequested();
    await fixtures.WhenAComponentIsCompleted();
    const exportData = await fixtures.WhenReadingTheSavedExportFromRepository();

    await fixtures.ThenExportDataShouldBeOk({
      exportData,
      componentsAreCompleted: true,
    });
  });

  it('should save entities working with transaction', async () => {
    await fixtures.GivenExportWithMultipleComponentsWasRequested();
    await fixtures.WhenAllComponentsAreCompletedConcurrentlyWithTransactions();

    const exportData = await fixtures.WhenReadingTheSavedExportFromRepository();

    fixtures.ThenAllExportComponentsShouldBeFinished({
      exportData,
    });
  });

  it('finds latest standalone exports for a given project', async () => {
    const projectId = fixtures.GivenProject();
    await fixtures.GivenMultipleExports(projectId);

    const {
      threeLatestExports,
      tenLatestExports,
    } = await fixtures.WhenRequestingLatestStandaloneExports(projectId);

    fixtures.ThenFilteredExportsShouldBeReturned(
      threeLatestExports,
      tenLatestExports,
    );
  });

  it('should delete an import when export is deleted', async () => {
    const {
      exportId,
      importId,
    } = await fixtures.GivenExportWithImportWasRequested();
    await fixtures.WhenExportIsDeleted(exportId, importId);
    await fixtures.ThenExportAndImportDoesNotExist(exportId, importId);
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
  const importRepo = app.get(ImportRepository);

  const ownerId = await GivenUserExists(app, 'aa');

  const amountOfExportsToFind = 5;
  const now = new Date();

  const exportFactory = (overrides: Partial<ExportSnapshot>) =>
    Export.fromSnapshot({
      id: v4(),
      archiveLocation: '',
      createdAt: now,
      exportPieces: [],
      foreignExport: false,
      importResourceId: undefined,
      ownerId,
      resourceId: v4(),
      resourceKind: ResourceKind.Project,
      ...overrides,
    });

  return {
    GivenProject: () => {
      return v4();
    },
    GivenMultipleExports: async (projectId: string) => {
      const archiveLocation = '/tmp/foo/bar.zip';

      const anotherProjectExport = exportFactory({
        resourceId: v4(),
        archiveLocation,
      });
      const cloningExport = exportFactory({
        resourceId: projectId,
        archiveLocation,
        importResourceId: v4(),
      });
      const unfinishedExport = exportFactory({
        resourceId: projectId,
      });

      const exportsToFind = Array(amountOfExportsToFind)
        .fill(0)
        .map((_, index) =>
          exportFactory({
            resourceId: projectId,
            archiveLocation,
            createdAt: new Date(now.getTime() - millisecondsInADay * index),
            exportPieces: [
              {
                finished: true,
                id: v4(),
                piece: ClonePiece.ExportConfig,
                resourceId: projectId,
                uris: [
                  {
                    relativePath: `bar-${index}.zip`,
                    uri: `/foo/bar-${index}.zip`,
                  },
                ],
              },
            ],
          }),
        );

      await Promise.all([
        repo.save(anotherProjectExport),
        repo.save(cloningExport),
        repo.save(unfinishedExport),
        ...exportsToFind.map((exportInstance) => repo.save(exportInstance)),
      ]);
    },
    GivenExportWasRequested: async () => {
      resourceId = ResourceId.create();
      componentId = ComponentId.create();
      componentLocationUri = '/foo/bar/project-metadata.json';
      componentLocationRelativePath = 'project-metadata.json';
      const cloning = false;
      const foreignExport = false;
      const exportInstance = Export.newOne(
        resourceId,
        ResourceKind.Project,
        new UserId(ownerId),
        [
          ExportComponent.fromSnapshot({
            finished: false,
            piece: ClonePiece.ProjectMetadata,
            resourceId: resourceId.value,
            id: componentId.value,
            uris: [
              new ComponentLocation(
                componentLocationUri,
                componentLocationRelativePath,
              ),
            ],
          }),
        ],
        cloning,
        foreignExport,
      );
      exportId = exportInstance.id;
      await repo.save(exportInstance);
    },
    GivenExportWithMultipleComponentsWasRequested: async () => {
      resourceId = ResourceId.create();

      componentLocationUri = `/foo/bar/project-metadata.json`;
      componentLocationRelativePath = `project-metadata.json`;

      const components = Array(10).map(() =>
        ExportComponent.fromSnapshot({
          finished: false,
          piece: ClonePiece.ProjectMetadata,
          resourceId: resourceId.value,
          id: ComponentId.create().value,
          uris: [
            new ComponentLocation(
              componentLocationUri,
              componentLocationRelativePath,
            ),
          ],
        }),
      );

      const cloning = false;
      const foreignExport = false;

      const exportInstance = Export.newOne(
        resourceId,
        ResourceKind.Project,
        new UserId(ownerId),
        components,
        cloning,
        foreignExport,
      );
      exportId = exportInstance.id;
      await repo.transaction(async (repository) => {
        await repository.save(exportInstance);
      });
    },
    GivenExportWithImportWasRequested: async () => {
      resourceId = ResourceId.create();
      const cloning = true;
      const foreignExport = false;
      const exportInstance = Export.newOne(
        resourceId,
        ResourceKind.Project,
        new UserId(ownerId),
        [],
        cloning,
        foreignExport,
      );
      exportId = exportInstance.id;
      await repo.save(exportInstance);

      const importResourceId = ResourceId.create();
      const archiveLocation = new ArchiveLocation('/tmp/file.zip');
      const importInstance = Import.newOne(
        importResourceId,
        ResourceKind.Project,
        importResourceId,
        new UserId(ownerId),
        archiveLocation,
        [],
        cloning,
        exportId,
      );
      const importId = importInstance.importId;
      await importRepo.save(importInstance);

      return { exportId, importId };
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
    WhenAllComponentsAreCompletedConcurrentlyWithTransactions: async () => {
      const componentLocation = new ComponentLocation(
        componentLocationUri,
        componentLocationRelativePath,
      );
      const exportInstance = (await repo.find(exportId)) as Export;
      expect(exportInstance).toBeDefined();

      await Promise.all(
        exportInstance.toSnapshot().exportPieces.map((piece) =>
          repo.transaction(async (repository) => {
            exportInstance.completeComponent(new ComponentId(piece.id), [
              componentLocation,
            ]);
            await repository.save(exportInstance);
          }),
        ),
      );
    },
    WhenReadingTheSavedExportFromRepository: async () => {
      return await repo.find(exportId);
    },
    WhenRequestingLatestStandaloneExports: async (projectId: string) => {
      return {
        threeLatestExports: await repo.findLatestExportsFor(projectId, 3, {
          isFinished: true,
          isLocal: true,
          isStandalone: true,
        }),
        tenLatestExports: await repo.findLatestExportsFor(projectId, 10, {
          isFinished: true,
          isLocal: true,
          isStandalone: true,
        }),
      };
    },
    WhenExportIsDeleted: async (exportId: ExportId, importId?: ImportId) => {
      const savedExport = await repo.find(exportId);
      expect(savedExport).toBeDefined();

      if (importId) {
        const savedImport = await importRepo.find(importId);
        expect(savedImport).toBeDefined();
      }

      return repo.delete(exportId);
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
      expect(exportData!.importResourceId).toBe(undefined);

      const exportSnapshot = exportData!.toSnapshot();

      expect(exportSnapshot.ownerId).toBe(ownerId);
      expect(exportSnapshot.exportPieces).toHaveLength(1);

      const [exportComponent] = exportSnapshot.exportPieces;

      expect(exportComponent.finished).toBe(componentsAreCompleted);
      expect(exportComponent.piece).toBe(ClonePiece.ProjectMetadata);
      expect(exportComponent.resourceId).toBe(resourceId.value);

      if (componentsAreCompleted) {
        expect(exportComponent.uris).toBeDefined();
        expect(exportComponent.uris.length).toBeGreaterThan(0);

        expect(
          exportComponent.uris.every((el) => el.uri === componentLocationUri),
        ).toEqual(true);
        expect(
          exportComponent.uris.every(
            (el) => el.relativePath === componentLocationRelativePath,
          ),
        ).toEqual(true);
      }
    },
    ThenAllExportComponentsShouldBeFinished: ({
      exportData,
    }: {
      exportData: Export | undefined;
    }) => {
      expect(exportData).toBeDefined();
      expect(
        exportData!.toSnapshot().exportPieces.every((piece) => piece.finished),
      ).toEqual(true);
    },
    ThenFilteredExportsShouldBeReturned: (
      threeLatestExports: Export[],
      tenLatestExports: Export[],
    ) => {
      expect(threeLatestExports).toHaveLength(3);
      expect(tenLatestExports).toHaveLength(amountOfExportsToFind);

      const [first, second, third] = threeLatestExports;

      expect(first.toSnapshot().createdAt.getTime()).toEqual(now.getTime());
      expect(first.toSnapshot().createdAt.getTime()).toBeGreaterThan(
        second.toSnapshot().createdAt.getTime(),
      );

      expect(second.toSnapshot().createdAt.getTime()).toBeGreaterThan(
        third.toSnapshot().createdAt.getTime(),
      );

      expect(
        tenLatestExports.every(
          (exportInstance) =>
            exportInstance.toSnapshot().exportPieces.length === 1,
        ),
      ).toEqual(true);
    },
    ThenExportAndImportDoesNotExist: async (
      exportId: ExportId,
      importId?: ImportId,
    ) => {
      const deletedExport = await repo.find(exportId);
      expect(deletedExport).toBeUndefined();

      if (importId) {
        const deletedImport = await importRepo.find(importId);
        expect(deletedImport).toBeUndefined();
      }
    },
  };
};
