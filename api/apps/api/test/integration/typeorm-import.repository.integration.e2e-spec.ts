import { ImportEntity } from '@marxan-api/modules/clone/import/adapters/entities/imports.api.entity';
import { ImportAdaptersModule } from '@marxan-api/modules/clone/import/adapters/import-adapters.module';
import { ImportRepository } from '@marxan-api/modules/clone/import/application/import.repository.port';
import {
  Import,
  ImportComponent,
  ImportId,
} from '@marxan-api/modules/clone/import/domain';
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
import { Test } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { hash } from 'bcrypt';
import { Connection, Repository } from 'typeorm';
import { ImportComponentStatuses } from '../../src/modules/clone/import/domain/import/import-component-status';
import { User } from '../../src/modules/users/user.api.entity';
import { apiConnections } from '../../src/ormconfig';

describe('Typeorm import repository', () => {
  let fixtures: FixtureType<typeof getFixtures>;

  beforeEach(async () => {
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
  let importId: ImportId;
  let importResourceId: ResourceId;
  let componentId: ComponentId;
  let archiveLocation: ArchiveLocation;
  const ownerId = UserId.create();

  const testingModule = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        ...apiConnections.default,
        keepConnectionAlive: true,
      }),
      TypeOrmModule.forFeature([User]),
      ImportAdaptersModule,
    ],
  }).compile();

  const repo = testingModule.get<ImportRepository>(ImportRepository);
  const userRepo = testingModule.get<Repository<User>>(
    getRepositoryToken(User),
  );

  const passwordHash = await hash('supersecretpassword', 10);

  await userRepo.save({
    id: ownerId.value,
    email: `${ownerId.value}@test.com`,
    passwordHash,
  });

  return {
    cleanup: async () => {
      const connection = testingModule.get<Connection>(Connection);
      const importRepo = connection.getRepository(ImportEntity);
      await importRepo.delete({});
      await userRepo.delete({ id: ownerId.value });
      await testingModule.close();
    },
    GivenImportWasRequested: async () => {
      importResourceId = ResourceId.create();
      const isCloning = false;
      const projectId = importResourceId;
      componentId = ComponentId.create();
      archiveLocation = new ArchiveLocation('/tmp/file.zip');

      const importInstance = Import.newOne(
        importResourceId,
        ResourceKind.Project,
        projectId,
        ownerId,
        archiveLocation,
        [
          ImportComponent.fromSnapshot({
            order: 0,
            status: ImportComponentStatuses.Submitted,
            piece: ClonePiece.ProjectMetadata,
            resourceId: importResourceId.value,
            id: componentId.value,
            uris: [
              new ComponentLocation('/tmp/file.zip', 'project-metadata.json'),
            ],
          }),
        ],
        isCloning,
      );
      importId = importInstance.importId;
      await repo.save(importInstance);
    },
    GivenImportWithMultipleComponentsWasRequested: async () => {
      importResourceId = ResourceId.create();
      const isCloning = false;
      const projectId = importResourceId;

      archiveLocation = new ArchiveLocation('/tmp/file.zip');

      const components = Array(10).map(() =>
        ImportComponent.fromSnapshot({
          order: 0,
          status: ImportComponentStatuses.Submitted,
          piece: ClonePiece.ProjectMetadata,
          resourceId: importResourceId.value,
          id: ComponentId.create().value,
          uris: [
            new ComponentLocation('/tmp/file.zip', `project-metadata.json`),
          ],
        }),
      );

      const importInstance = Import.newOne(
        importResourceId,
        ResourceKind.Project,
        projectId,
        ownerId,
        archiveLocation,
        components,
        isCloning,
      );
      importId = importInstance.importId;
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
      expect(importSnapshot.resourceId).toBe(importResourceId.value);
      expect(importSnapshot.isCloning).toBe(false);

      expect(importSnapshot.importPieces).toHaveLength(1);

      const [importComponent] = importSnapshot.importPieces;

      expect(importComponent.status).toBe(
        componentsAreCompleted
          ? ImportComponentStatuses.Completed
          : ImportComponentStatuses.Submitted,
      );
      expect(importComponent.piece).toBe(ClonePiece.ProjectMetadata);
      expect(importComponent.resourceId).toBe(importResourceId.value);
    },
    ThenAllImportComponentsShouldBeFinished: ({
      importData,
    }: {
      importData: Import | undefined;
    }) => {
      expect(importData).toBeDefined();
      expect(
        importData!
          .toSnapshot()
          .importPieces.every(
            (piece) => piece.status === ImportComponentStatuses.Completed,
          ),
      ).toEqual(true);
    },
  };
};
