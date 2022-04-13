import { API_EVENT_KINDS } from '@marxan/api-events';
import {
  ArchiveLocation,
  ClonePiece,
  ComponentId,
  ResourceId,
  ResourceKind,
} from '@marxan/cloning/domain';
import { UserId } from '@marxan/domain-ids';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Logger } from '@nestjs/common';
import { CommandBus, CommandHandler, CqrsModule, ICommand } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { ApiEventsService } from '../../../api-events';
import { MemoryImportRepository } from '../../import/adapters/memory-import.repository.adapter';
import { ImportRepository } from '../../import/application/import.repository.port';
import { Import, ImportComponent, ImportId } from '../../import/domain';
import { importPieceQueueToken } from './import-queue.provider';
import { MarkImportAsFailed } from './mark-import-as-failed.command';
import { MarkImportPieceAsFailed } from './mark-import-piece-as-failed.command';
import { SchedulePieceImport } from './schedule-piece-import.command';
import { SchedulePieceImportHandler } from './schedule-piece-import.handler';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

it('should add a import-piece job to the queue and create a import piece submitted api event', async () => {
  const [importInstance, componentId] = await fixtures.GivenImportIsCreated();
  fixtures.GivenSchedulePieceImportCommand(importInstance, componentId);

  await fixtures.WhenSchedulePieceImportHandlerIsInvoked({
    addMockResolvedValue: 'job',
  });

  fixtures.ThenImportPieceSubmittedApiEventIsCreated();
});

it('should send a MarkImportAsFailed command if the import instance cannot be retrieved', async () => {
  fixtures.GivenSchedulePieceImportCommand(
    ImportId.create(),
    ComponentId.create(),
  );

  await fixtures.WhenSchedulePieceImportHandlerIsInvoked({
    addMockResolvedValue: 'job',
  });

  fixtures.ThenMarkImportAsFailedCommandIsSent();
});

it('should send a MarkImportAsFailed command if the import component is not found in import pieces', async () => {
  const [importInstance] = await fixtures.GivenImportIsCreated();

  fixtures.GivenSchedulePieceImportCommand(
    importInstance,
    ComponentId.create(),
  );

  await fixtures.WhenSchedulePieceImportHandlerIsInvoked({
    addMockResolvedValue: 'job',
  });

  fixtures.ThenMarkImportAsFailedCommandIsSent();
});

it('should send a MarkImportPieceAsFailed command if the job cannot be added to the queue', async () => {
  const [importInstance, componentId] = await fixtures.GivenImportIsCreated();
  fixtures.GivenSchedulePieceImportCommand(importInstance, componentId);

  await fixtures.WhenSchedulePieceImportHandlerIsInvoked({
    addMockResolvedValue: undefined,
  });

  fixtures.ThenMarkImportPieceAsFailedCommandIsSent();
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
        provide: Logger,
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
      FakeMarkImportPieceAsFailedHandler,
      FakeMarkImportAsFailedHandler,
    ],
  }).compile();
  await sandbox.init();

  const ownerId = UserId.create();
  const commands: ICommand[] = [];
  sandbox.get(CommandBus).subscribe((command) => {
    commands.push(command);
  });
  let command: SchedulePieceImport;

  const sut = sandbox.get(SchedulePieceImportHandler);
  const importRepo = sandbox.get(ImportRepository);

  return {
    GivenImportIsCreated: async (): Promise<[ImportId, ComponentId]> => {
      const importResourceId = ResourceId.create();
      const isCloning = false;
      const projectId = importResourceId;
      const importComponent = ImportComponent.newOne(
        projectId,
        ClonePiece.ProjectMetadata,
        0,
        [],
      );
      const importInstance = Import.newOne(
        importResourceId,
        ResourceKind.Project,
        projectId,
        ownerId,
        new ArchiveLocation('/tmp/foo.zip'),
        [importComponent],
        isCloning,
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
    ThenMarkImportAsFailedCommandIsSent: () => {
      expect(commands).toHaveLength(1);
      const [markImportAsFailedCommand] = commands;
      expect(markImportAsFailedCommand).toBeInstanceOf(MarkImportAsFailed);
    },
    ThenMarkImportPieceAsFailedCommandIsSent: () => {
      expect(commands).toHaveLength(1);
      const [markImportPieceAsFailedCommand] = commands;
      expect(markImportPieceAsFailedCommand).toBeInstanceOf(
        MarkImportPieceAsFailed,
      );
    },
  };
};

@CommandHandler(MarkImportPieceAsFailed)
class FakeMarkImportPieceAsFailedHandler {
  async execute(): Promise<void> {}
}

@CommandHandler(MarkImportAsFailed)
class FakeMarkImportAsFailedHandler {
  async execute(): Promise<void> {}
}
