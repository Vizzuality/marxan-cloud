import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Test } from '@nestjs/testing';
import { CqrsModule, EventBus, IEvent } from '@nestjs/cqrs';
import { Either, isLeft, isRight, left, Right, right } from 'fp-ts/Either';

import {
  Failure as RepoFailure,
  ImportRepository,
  Success,
} from './import.repository.port';

import {
  ArchiveReader,
  Failure as ArchiveFailure,
  invalidFiles,
  Success as ArchiveSuccess,
} from './archive-reader.port';

import {
  ArchiveLocation,
  ClonePiece,
  ComponentId,
  ComponentLocation,
  ResourceId,
  ResourceKind,
} from '@marxan/cloning/domain';
import {
  Import,
  ImportId,
  ImportRequested,
  ImportSnapshot,
  PieceImportRequested,
} from '../domain';
import { ImportArchive } from './import-archive';
import { PromiseType } from 'utility-types';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

test(`importing invalid archive`, async () => {
  await fixtures.GivenExtractingArchiveFails();
  const result = await fixtures.WhenRequestingImport();
  fixtures.ThenImportFails(result);
});

test(`importing archive with sequential components`, async () => {
  await fixtures.GivenExtractingArchiveHasSequentialComponents();
  const result = await fixtures.WhenRequestingImport();
  fixtures.ThenRequestImportIsSaved(result);
  fixtures.ThenImportRequestedIsEmitted();
  fixtures.ThenLowestOrderComponentIsRequested();
});

test(`importing archive with equal order components`, async () => {
  await fixtures.GivenExtractingArchiveHasEqualComponents();
  const result = await fixtures.WhenRequestingImport();
  fixtures.ThenRequestImportIsSaved(result);
  fixtures.ThenImportRequestedIsEmitted();
  fixtures.ThenAllComponentsAreRequested();
});

const getFixtures = async () => {
  const sandbox = await Test.createTestingModule({
    imports: [CqrsModule],
    providers: [
      {
        provide: ImportRepository,
        useClass: InMemoryRepo,
      },
      {
        provide: ArchiveReader,
        useClass: FakeArchiveReader,
      },
      ImportArchive,
    ],
  }).compile();
  await sandbox.init();

  const events: IEvent[] = [];
  sandbox.get(EventBus).subscribe((event) => events.push(event));

  const sut = sandbox.get(ImportArchive);
  const repo: InMemoryRepo = sandbox.get(ImportRepository);
  const archiveReader: FakeArchiveReader = sandbox.get(ArchiveReader);

  return {
    GivenExtractingArchiveFails: () => {
      archiveReader.mock.mockImplementation(async () => left(invalidFiles));
    },
    GivenExtractingArchiveHasSequentialComponents: () => {
      archiveReader.mock.mockImplementation(async () =>
        right({
          archiveLocation: new ArchiveLocation('whatever'),
          resourceId: new ResourceId(`resource-id`),
          resourceKind: ResourceKind.Project,
          importPieces: [
            {
              finished: false,
              order: 0,
              resourceId: new ResourceId(`project-id`),
              id: new ComponentId(`import component unique id`),
              piece: ClonePiece.ProjectMetadata,
              uris: [
                new ComponentLocation(
                  `/tmp/project-metadata-random-uuid.json`,
                  `project-metadata.json`,
                ),
              ],
            },
            {
              finished: false,
              order: 1,
              resourceId: new ResourceId(`project-id`),
              id: new ComponentId(`some other piece`),
              piece: ClonePiece.PlanningAreaGAdm,
              uris: [
                new ComponentLocation(
                  `/tmp/project-planning-area-random-uuid.json`,
                  `planning-area/config.json`,
                ),
              ],
            },
          ],
        }),
      );
    },
    GivenExtractingArchiveHasEqualComponents: () => {
      archiveReader.mock.mockImplementation(async () =>
        right({
          archiveLocation: new ArchiveLocation('whatever'),
          resourceId: new ResourceId(`resource-id`),
          resourceKind: ResourceKind.Project,
          importPieces: [
            {
              finished: false,
              order: 2,
              resourceId: new ResourceId(`project-id`),
              id: new ComponentId(`import component unique id`),
              piece: ClonePiece.ProjectMetadata,
              uris: [
                new ComponentLocation(
                  `/tmp/project-metadata-random-uuid.json`,
                  `project-metadata.json`,
                ),
              ],
            },
            {
              finished: false,
              order: 2,
              resourceId: new ResourceId(`project-id`),
              id: new ComponentId(`some other piece`),
              piece: ClonePiece.PlanningAreaGAdm,
              uris: [
                new ComponentLocation(
                  `/tmp/project-planning-area-random-uuid.json`,
                  `planning-area/config.json`,
                ),
              ],
            },
          ],
        }),
      );
    },
    WhenRequestingImport: async () =>
      sut.import(new ArchiveLocation(`whatever`)),
    ThenRequestImportIsSaved: (
      importResult: PromiseType<ReturnType<ImportArchive['import']>>,
    ) => {
      expect(isRight(importResult)).toBeTruthy();
      expect(
        repo.entities[(importResult as Right<string>).right],
      ).toBeDefined();
    },
    ThenImportFails: (
      importResult: PromiseType<ReturnType<ImportArchive['import']>>,
    ) => {
      expect(isLeft(importResult)).toBeTruthy();
    },
    ThenImportRequestedIsEmitted: () => {
      expect(
        events.filter((event) => event instanceof ImportRequested),
      ).toEqual([
        {
          id: expect.any(String),
          resourceId: new ResourceId(`resource-id`),
          resourceKind: `project`,
        },
      ]);
    },
    ThenLowestOrderComponentIsRequested: () => {
      expect(
        events.filter((event) => event instanceof PieceImportRequested),
      ).toMatchObject([
        {
          id: new ComponentId(`import component unique id`),
          resourceId: new ResourceId(`project-id`),
          piece: `project-metadata`,
          uris: [
            {
              relativePath: `project-metadata.json`,
              uri: `/tmp/project-metadata-random-uuid.json`,
            },
          ],
        },
      ]);
    },
    ThenAllComponentsAreRequested: () => {
      expect(
        events.filter((event) => event instanceof PieceImportRequested),
      ).toMatchObject([
        {
          id: new ComponentId(`import component unique id`),
          resourceId: new ResourceId(`project-id`),
          piece: `project-metadata`,
          uris: [
            {
              relativePath: `project-metadata.json`,
              uri: `/tmp/project-metadata-random-uuid.json`,
            },
          ],
        },
        {
          id: new ComponentId(`some other piece`),
          resourceId: new ResourceId(`project-id`),
          piece: `planning-area-gadm`,
          uris: [
            {
              relativePath: `planning-area/config.json`,
              uri: `/tmp/project-planning-area-random-uuid.json`,
            },
          ],
        },
      ]);
    },
  };
};

class FakeArchiveReader extends ArchiveReader {
  mock: jest.MockedFunction<ArchiveReader['get']> = jest.fn();

  async get(
    archive: ArchiveLocation,
  ): Promise<Either<ArchiveFailure, ArchiveSuccess>> {
    return this.mock(archive);
  }
}

class InMemoryRepo extends ImportRepository {
  entities: Record<string, ImportSnapshot> = {};

  async find(importId: ImportId): Promise<Import | undefined> {
    const snapshot = this.entities[importId.value];
    if (!snapshot) return;

    return Import.from(snapshot);
  }

  async save(importRequest: Import): Promise<Either<RepoFailure, Success>> {
    const snapshot = importRequest.toSnapshot();
    this.entities[snapshot.id.value] = snapshot;
    return right(true);
  }
}
