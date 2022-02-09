import { ImportEntity } from '@marxan-api/modules/clone/import/application/import-repository/entities/imports.api.entity';
import { ImportRepository } from '@marxan-api/modules/clone/import/application/import-repository/import.repository.port';
import { Import, ImportId } from '@marxan-api/modules/clone/import/domain';
import {
  ArchiveLocation,
  ClonePiece,
  ComponentId,
  ComponentLocation,
  ResourceId,
  ResourceKind,
} from '@marxan/cloning/domain';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { ImportComponentLocationEntity } from '../../src/modules/clone/import/application/import-repository/entities/component-locations.api.entity';
import { ImportComponentEntity } from '../../src/modules/clone/import/application/import-repository/entities/import-components.api.entity';
import { MemoryImportRepository } from '../../src/modules/clone/import/application/import-repository/memory-import.repository.adapter';
import { ImportComponent } from '../../src/modules/clone/import/domain/import/import-component';
import { apiConnections } from '../../src/ormconfig';

describe('Typeorm import repository', () => {
  let fixtures: FixtureType<typeof getFixtures>;

  beforeEach(async () => {
    console.log('hey');
    fixtures = await getFixtures();
  }, 20000);

  afterAll(async () => {
    await fixtures.cleanup();
  });

  it('should expose methods for getting an import by id and storing imports', async () => {
    await fixtures.GivenImportWasRequested();
    const importData = await fixtures.WhenReadingTheSavedImportFromRepository();
    await fixtures.ThenImportDataShouldBeOk({
      importData,
      componentsAreCompleted: false,
    });
  });

  it('should update an import when a nested piece is completed', async () => {
    await fixtures.GivenImportWasRequested();
    await fixtures.WhenAComponentIsCompleted();
    const importData = await fixtures.WhenReadingTheSavedImportFromRepository();
    await fixtures.ThenImportDataShouldBeOk({
      importData,
      componentsAreCompleted: true,
    });
  });

  it('should save entities working with transaction', async () => {
    await fixtures.GivenImportWithMultipleComponentsWasRequested();
    await fixtures.WhenAllComponentsAreCompletedConcurrentlyWithTransactions();
    const importData = await fixtures.WhenReadingTheSavedImportFromRepository();
    fixtures.ThenAllImportComponentsShouldBeFinished({
      importData,
    });
  });
});

const getFixtures = async () => {
  console.log('hola');
  let importId: ImportId;
  let resourceId: ResourceId;
  let componentId: ComponentId;
  let archiveLocation: ArchiveLocation;

  // TODO Use actual typeorm implementation
  // const app = await bootstrapApplication();
  const testingModule = await Test.createTestingModule({
    imports: [],
    providers: [
      {
        provide: ImportRepository,
        useClass: MemoryImportRepository,
      },
    ],
  }).compile();

  const repo = testingModule.get<ImportRepository>(ImportRepository);

  return {
    cleanup: async () => {
      const connection = testingModule.get<Connection>(Connection);
      const importRepo = connection.getRepository(ImportEntity);
      await importRepo.delete({});
      await testingModule.close();
    },
    GivenImportWasRequested: async () => {
      resourceId = ResourceId.create();
      componentId = ComponentId.create();
      archiveLocation = new ArchiveLocation('/tmp/file.zip');

      const importInstance = Import.newOne(
        resourceId,
        ResourceKind.Project,
        archiveLocation,
        [
          ImportComponent.fromSnapshot({
            order: 0,
            finished: false,
            piece: ClonePiece.ProjectMetadata,
            resourceId: resourceId.value,
            id: componentId.value,
            uris: [
              new ComponentLocation('/tmp/file.zip', 'project-metadata.json'),
            ],
          }),
        ],
      );
      importId = importInstance.id;
      await repo.save(importInstance);
    },
    GivenImportWithMultipleComponentsWasRequested: async () => {
      resourceId = ResourceId.create();

      archiveLocation = new ArchiveLocation('/tmp/file.zip');

      const components = Array(10).map(() =>
        ImportComponent.fromSnapshot({
          order: 0,
          finished: false,
          piece: ClonePiece.ProjectMetadata,
          resourceId: resourceId.value,
          id: ComponentId.create().value,
          uris: [
            new ComponentLocation('/tmp/file.zip', `project-metadata.json`),
          ],
        }),
      );

      const importInstance = Import.newOne(
        resourceId,
        ResourceKind.Project,
        archiveLocation,
        components,
      );
      importId = importInstance.id;
      await repo.transaction(async (repository) => {
        await repository.save(importInstance);
      });
    },
    WhenAComponentIsCompleted: async () => {
      const importInstance = (await repo.find(importId)) as Import;
      expect(importInstance).toBeDefined();

      importInstance.completePiece(componentId);
      await repo.save(importInstance);
    },
    WhenAllComponentsAreCompletedConcurrentlyWithTransactions: async () => {
      const importInstance = (await repo.find(importId)) as Import;
      expect(importInstance).toBeDefined();

      await Promise.all(
        importInstance.toSnapshot().importPieces.map((piece) =>
          repo.transaction(async (repository) => {
            importInstance.completePiece(new ComponentId(piece.id));
            await repository.save(importInstance);
          }),
        ),
      );
    },
    WhenReadingTheSavedImportFromRepository: async () => {
      return await repo.find(importId);
    },
    ThenImportDataShouldBeOk: async ({
      importData,
      componentsAreCompleted,
    }: {
      importData: Import | undefined;
      componentsAreCompleted: boolean;
    }) => {
      expect(importData).toBeDefined();
      const importSnapshot = importData!.toSnapshot();
      expect(importSnapshot.id).toBe(importId.value);
      expect(importSnapshot.resourceKind).toBe(ResourceKind.Project);
      expect(importSnapshot.resourceId).toBe(resourceId.value);

      expect(importSnapshot.importPieces).toHaveLength(1);

      const [importComponent] = importSnapshot.importPieces;

      expect(importComponent.finished).toBe(componentsAreCompleted);
      expect(importComponent.piece).toBe(ClonePiece.ProjectMetadata);
      expect(importComponent.resourceId).toBe(resourceId.value);
    },
    ThenAllImportComponentsShouldBeFinished: ({
      importData,
    }: {
      importData: Import | undefined;
    }) => {
      expect(importData).toBeDefined();
      expect(
        importData!.toSnapshot().importPieces.every((piece) => piece.finished),
      ).toEqual(true);
    },
  };
};
