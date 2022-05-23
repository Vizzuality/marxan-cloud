import { ApiEventsService } from '@marxan-api/modules/api-events';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ResourceId } from '@marxan/cloning/domain';
import { UserId } from '@marxan/domain-ids';
import { LegacyProjectImportPiece } from '@marxan/legacy-project-import';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Logger } from '@nestjs/common';
import { CommandBus, CommandHandler, CqrsModule, ICommand } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { v4 } from 'uuid';
import { MarkLegacyProjectImportAsFailed } from '../application/mark-legacy-project-import-as-failed.command';
import { MarkLegacyProjectImportPieceAsFailed } from '../application/mark-legacy-project-import-piece-as-failed.command';
import { LegacyProjectImport } from '../domain/legacy-project-import/legacy-project-import';
import { LegacyProjectImportComponent } from '../domain/legacy-project-import/legacy-project-import-component';
import { LegacyProjectImportComponentId } from '../domain/legacy-project-import/legacy-project-import-component.id';
import { LegacyProjectImportRepository } from '../domain/legacy-project-import/legacy-project-import.repository';
import { LegacyProjectImportMemoryRepository } from './legacy-project-import-memory.repository';
import { importLegacyProjectPieceQueueToken } from './legacy-project-import-queue.provider';
import { ScheduleLegacyProjectImportPiece } from './schedule-legacy-project-import-piece.command';
import { ScheduleLegacyProjectImportPieceHandler } from './schedule-legacy-project-import-piece.handler';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

it('should add a legacy-project-import-piece job to the queue and create a legacy project import piece submitted api event', async () => {
  const [
    legacyProjectImportInstance,
    component,
  ] = await fixtures.GivenLegacyProjectImportIsCreated();
  const commandToBeSend = fixtures.GivenScheduleLegacyProjectImportPieceCommand(
    legacyProjectImportInstance,
    component,
  );

  await fixtures.WhenScheduleLegacyProjectImportPieceHandlerIsInvoked(
    commandToBeSend,
    {
      addMockResolvedValue: 'job',
    },
  );

  fixtures.ThenLegacyProjectImportPieceSubmittedApiEventIsCreated(
    commandToBeSend,
  );
});

it('should send a MarkLegacyProjectImportAsFailed command if the legacy project import cannot be retrieved', async () => {
  const commandToBeSend = fixtures.GivenScheduleLegacyProjectImportPieceCommandWithInvalidProjectId();

  await fixtures.WhenScheduleLegacyProjectImportPieceHandlerIsInvoked(
    commandToBeSend,
    {
      addMockResolvedValue: 'job',
    },
  );

  fixtures.ThenMarkLegacyProjectImportAsFailedCommandIsSent(commandToBeSend);
});

it('should send a MarkLegacyProjectImportAsFailed command if the legacy project import component is not found', async () => {
  const [
    legacyProjectImportInstance,
  ] = await fixtures.GivenLegacyProjectImportIsCreated();

  const commandToBeSend = fixtures.GivenScheduleLegacyProjectImportPieceCommandWithInvalidComponentId(
    legacyProjectImportInstance,
  );

  await fixtures.WhenScheduleLegacyProjectImportPieceHandlerIsInvoked(
    commandToBeSend,
    {
      addMockResolvedValue: 'job',
    },
  );

  fixtures.ThenMarkLegacyProjectImportAsFailedCommandIsSent(commandToBeSend, {
    invalidComponentId: true,
  });
});

it('should send a MarkImportPieceAsFailed command if the job cannot be added to the queue', async () => {
  const [
    legacyProjectImportInstance,
    component,
  ] = await fixtures.GivenLegacyProjectImportIsCreated();
  const commandToBeSend = fixtures.GivenScheduleLegacyProjectImportPieceCommand(
    legacyProjectImportInstance,
    component,
  );

  await fixtures.WhenScheduleLegacyProjectImportPieceHandlerIsInvoked(
    commandToBeSend,
    {
      addMockResolvedValue: undefined,
    },
  );

  fixtures.ThenMarkLegacyProjectImportPieceAsFailedCommandIsSent(
    commandToBeSend,
  );
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
        provide: importLegacyProjectPieceQueueToken,
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
        provide: LegacyProjectImportRepository,
        useClass: LegacyProjectImportMemoryRepository,
      },
      ScheduleLegacyProjectImportPieceHandler,
      FakeMarkLegacyProjectImportAsFailedHandler,
      FakeMarkLegacyProjectImportPieceAsFailedHandler,
    ],
  }).compile();
  await sandbox.init();

  const ownerId = UserId.create();
  const commands: ICommand[] = [];
  sandbox.get(CommandBus).subscribe((command) => {
    commands.push(command);
  });
  let command: ScheduleLegacyProjectImportPiece;

  const sut = sandbox.get(ScheduleLegacyProjectImportPieceHandler);
  const repo = sandbox.get(LegacyProjectImportRepository);

  return {
    GivenLegacyProjectImportIsCreated: async (): Promise<
      [LegacyProjectImport, LegacyProjectImportComponent]
    > => {
      const projectId = ResourceId.create();
      const scenarioId = ResourceId.create();
      const id = v4();
      const legacyProjectImportComponent = LegacyProjectImportComponent.newOne(
        LegacyProjectImportPiece.PlanningGrid,
      );
      const legacyProjectImport = LegacyProjectImport.fromSnapshot({
        id,
        projectId: projectId.value,
        scenarioId: scenarioId.value,
        ownerId: ownerId.value,
        isAcceptingFiles: false,
        pieces: [legacyProjectImportComponent.toSnapshot()],
        files: [],
      });

      await repo.save(legacyProjectImport);

      return [legacyProjectImport, legacyProjectImportComponent];
    },
    GivenScheduleLegacyProjectImportPieceCommandWithInvalidProjectId: () => {
      command = new ScheduleLegacyProjectImportPiece(
        ResourceId.create(),
        LegacyProjectImportComponentId.create(),
      );

      return command;
    },
    GivenScheduleLegacyProjectImportPieceCommandWithInvalidComponentId: (
      legacyProjectImport: LegacyProjectImport,
    ) => {
      const { projectId } = legacyProjectImport.toSnapshot();

      return new ScheduleLegacyProjectImportPiece(
        new ResourceId(projectId),
        LegacyProjectImportComponentId.create(),
      );
    },
    GivenScheduleLegacyProjectImportPieceCommand: (
      legacyProjectImport: LegacyProjectImport,
      legacyProjectImportComponent: LegacyProjectImportComponent,
    ): ScheduleLegacyProjectImportPiece => {
      const { projectId } = legacyProjectImport.toSnapshot();

      return new ScheduleLegacyProjectImportPiece(
        new ResourceId(projectId),
        legacyProjectImportComponent.id,
      );
    },
    WhenScheduleLegacyProjectImportPieceHandlerIsInvoked: async (
      commandSend: ScheduleLegacyProjectImportPiece,
      {
        addMockResolvedValue,
      }: {
        addMockResolvedValue?: string;
      },
    ) => {
      addMock.mockResolvedValueOnce(addMockResolvedValue);

      await sut.execute(commandSend);
    },
    ThenLegacyProjectImportPieceSubmittedApiEventIsCreated: async (
      commandSend: ScheduleLegacyProjectImportPiece,
    ) => {
      const { projectId, componentId } = commandSend;
      expect(createIfNotExistsMock).toHaveBeenCalledTimes(1);
      expect(createIfNotExistsMock).toHaveBeenCalledWith({
        kind:
          API_EVENT_KINDS.project__legacy__import__piece__submitted__v1__alpha,
        topic: componentId.value,
        data: {
          projectId: projectId.value,
          componentId: componentId.value,
          piece: LegacyProjectImportPiece.PlanningGrid,
        },
      });
    },
    ThenMarkLegacyProjectImportAsFailedCommandIsSent: (
      commandSend: ScheduleLegacyProjectImportPiece,
      { invalidComponentId } = { invalidComponentId: false },
    ) => {
      expect(commands).toHaveLength(1);
      const [markLegacyProjectImportAsFailedCommand] = commands;
      expect(markLegacyProjectImportAsFailedCommand).toBeInstanceOf(
        MarkLegacyProjectImportAsFailed,
      );
      const { projectId, componentId } = commandSend;
      const errorMsg = invalidComponentId
        ? `Legacy project import component with ID ${componentId.value} not found`
        : `Legacy project import with project ID ${projectId.value} not found`;

      expect(markLegacyProjectImportAsFailedCommand).toEqual(
        new MarkLegacyProjectImportAsFailed(projectId, errorMsg),
      );
    },
    ThenMarkLegacyProjectImportPieceAsFailedCommandIsSent: (
      commandSend: ScheduleLegacyProjectImportPiece,
    ) => {
      expect(commands).toHaveLength(1);
      const [markLegacyProjectImportPieceAsFailedCommand] = commands;
      expect(markLegacyProjectImportPieceAsFailedCommand).toBeInstanceOf(
        MarkLegacyProjectImportPieceAsFailed,
      );
      const { projectId, componentId } = commandSend;
      const errorMsg = `[ScheduleLegacyProjectImportPieceHandler] Unable to start job - projectId=${projectId.value}`;

      expect(markLegacyProjectImportPieceAsFailedCommand).toEqual(
        new MarkLegacyProjectImportPieceAsFailed(projectId, componentId, [
          errorMsg,
        ]),
      );
    },
  };
};

@CommandHandler(MarkLegacyProjectImportAsFailed)
class FakeMarkLegacyProjectImportAsFailedHandler {
  async execute(): Promise<void> {}
}

@CommandHandler(MarkLegacyProjectImportPieceAsFailed)
class FakeMarkLegacyProjectImportPieceAsFailedHandler {
  async execute(): Promise<void> {}
}
