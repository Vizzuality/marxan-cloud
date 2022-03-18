import { API_EVENT_KINDS } from '@marxan/api-events';
import {
  ArchiveLocation,
  ClonePiece,
  ComponentId,
  ResourceId,
  ResourceKind,
} from '@marxan/cloning/domain';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { ConsoleLogger } from '@nestjs/common';
import { CqrsModule, EventBus, IEvent } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { ApiEventsService } from '../../../api-events';
import { MemoryImportRepository } from '../../import/adapters/memory-import.repository.adapter';
import { ImportPieceFailed } from '../../import/application/import-piece-failed.event';
import { ImportRepository } from '../../import/application/import.repository.port';
import { Import, ImportComponent, ImportId } from '../../import/domain';
import { importPieceQueueToken } from './import-queue.provider';
import { SchedulePieceImport } from './schedule-piece-import.command';
import { SchedulePieceImportHandler } from './schedule-piece-import.handler';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

it('should add a import-piece job to the queue and create a import piece submitted api event', async () => {
  const [importId, componentId] = await fixtures.GivenImportIsCreated();
  fixtures.GivenSchedulePieceImportCommand(importId, componentId);

  await fixtures.WhenSchedulePieceImportHandlerIsInvoked({
    addMockResolvedValue: 'job',
  });

  fixtures.ThenImportPieceSubmittedApiEventIsCreated();
});

it('should emit an ImportPieceFailed event if the import instance cannot be retrieved', async () => {
  fixtures.GivenSchedulePieceImportCommand(
    ImportId.create(),
    ComponentId.create(),
  );

  await fixtures.WhenSchedulePieceImportHandlerIsInvoked({
    addMockResolvedValue: 'job',
  });

  fixtures.ThenImportPieceFailedEventIsPublished();
});

it('should emit an ImportPieceFailed event if the import component is not found in import pieces', async () => {
  const [importId] = await fixtures.GivenImportIsCreated();

  fixtures.GivenSchedulePieceImportCommand(importId, ComponentId.create());

  await fixtures.WhenSchedulePieceImportHandlerIsInvoked({
    addMockResolvedValue: 'job',
  });

  fixtures.ThenImportPieceFailedEventIsPublished();
});

it('should emit an ImportPieceFailed event if the job cannot be added to the queue', async () => {
  const [importId, componentId] = await fixtures.GivenImportIsCreated();
  fixtures.GivenSchedulePieceImportCommand(importId, componentId);

  await fixtures.WhenSchedulePieceImportHandlerIsInvoked({
    addMockResolvedValue: undefined,
  });

  fixtures.ThenImportPieceFailedEventIsPublished();
});

const getFixtures = async () => {
  const createIfNotExistsMock = jest.fn();
  const addMock = jest.fn();

  const sandbox = await Test.createTestingModule({
    imports: [CqrsModule],
    providers: [
      {
        provide: ApiEventsService,
        useValue: {
          createIfNotExists: createIfNotExistsMock,
        },
      },
      {
        provide: importPieceQueueToken,
        useValue: {
          add: addMock,
        },
      },
      {
        provide: ConsoleLogger,
        useValue: {
          setContext: () => {},
          error: () => {},
        },
      },
      {
        provide: ImportRepository,
        useClass: MemoryImportRepository,
      },
      SchedulePieceImportHandler,
    ],
  }).compile();
  await sandbox.init();

  const events: IEvent[] = [];
  sandbox.get(EventBus).subscribe((event) => {
    events.push(event);
  });
  let command: SchedulePieceImport;

  const sut = sandbox.get(SchedulePieceImportHandler);
  const importRepo = sandbox.get(ImportRepository);

  return {
    GivenImportIsCreated: async (): Promise<[ImportId, ComponentId]> => {
      const resourceId = ResourceId.create();
      const importComponent = ImportComponent.newOne(
        resourceId,
        ClonePiece.ProjectMetadata,
        0,
        [],
      );
      const importInstance = Import.newOne(
        resourceId,
        ResourceKind.Project,
        new ArchiveLocation('/tmp/foo.zip'),
        [importComponent],
      );
      await importRepo.save(importInstance);

      return [importInstance.importId, importComponent.id];
    },
    GivenSchedulePieceImportCommand: (
      importId: ImportId,
      componentId: ComponentId,
    ): SchedulePieceImport => {
      command = new SchedulePieceImport(importId, componentId);

      return command;
    },
    WhenSchedulePieceImportHandlerIsInvoked: async ({
      addMockResolvedValue,
    }: {
      addMockResolvedValue?: string;
    }) => {
      addMock.mockResolvedValueOnce(addMockResolvedValue);

      await sut.execute(command);
    },
    ThenImportPieceSubmittedApiEventIsCreated: () => {
      expect(createIfNotExistsMock).toHaveBeenCalledTimes(1);
      expect(createIfNotExistsMock).toHaveBeenCalledWith({
        kind: API_EVENT_KINDS.project__import__piece__submitted__v1__alpha,
        topic: command.componentId.value,
        data: expect.any(Object),
      });
    },
    ThenImportPieceFailedEventIsPublished: () => {
      expect(events).toHaveLength(1);
      const [exportPieceFailedEvent] = events;
      expect(exportPieceFailedEvent).toBeInstanceOf(ImportPieceFailed);
    },
  };
};
