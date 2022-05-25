import { CreateApiEventDTO } from '@marxan-api/modules/api-events/dto/create.api-event.dto';
import {
  CreateWithEventFactory,
  EventData,
  EventFactory,
  QueueEventsAdapter,
} from '@marxan-api/modules/queue-api-events';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ResourceId } from '@marxan/cloning/domain';
import {
  LegacyProjectImportJobInput,
  LegacyProjectImportJobOutput,
} from '@marxan/legacy-project-import';
import { Inject, Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CompleteLegacyProjectImportPiece } from '../application/complete-legacy-project-import-piece.command';
import { MarkLegacyProjectImportPieceAsFailed } from '../application/mark-legacy-project-import-piece-as-failed.command';
import { LegacyProjectImportComponentId } from '../domain/legacy-project-import/legacy-project-import-component.id';
import { importLegacyProjectPieceEventsFactoryToken } from './legacy-project-import-queue.provider';

@Injectable()
export class ImportLegacyProjectPieceEventsHandler
  implements
    EventFactory<LegacyProjectImportJobInput, LegacyProjectImportJobOutput> {
  private queueEvents: QueueEventsAdapter<
    LegacyProjectImportJobInput,
    LegacyProjectImportJobOutput
  >;

  constructor(
    @Inject(importLegacyProjectPieceEventsFactoryToken)
    queueEventsFactory: CreateWithEventFactory<
      LegacyProjectImportJobInput,
      LegacyProjectImportJobOutput
    >,
    private readonly commandBus: CommandBus,
  ) {
    this.queueEvents = queueEventsFactory(this);
    this.queueEvents.on(`completed`, (data) => this.completed(data));
    this.queueEvents.on(`failed`, (data) => this.failed(data));
  }

  async createCompletedEvent(
    eventData: EventData<
      LegacyProjectImportJobInput,
      LegacyProjectImportJobOutput
    >,
  ): Promise<CreateApiEventDTO> {
    const data = await eventData.data;
    const output = await eventData.result;
    const kind =
      API_EVENT_KINDS.project__legacy__import__piece__finished__v1__alpha;

    return {
      topic: data.pieceId,
      kind,
      data: {
        kind,
        ...output,
      },
    };
  }

  async createFailedEvent(
    eventData: EventData<
      LegacyProjectImportJobInput,
      LegacyProjectImportJobOutput
    >,
  ): Promise<CreateApiEventDTO> {
    const data = await eventData.data;
    const kind =
      API_EVENT_KINDS.project__legacy__import__piece__failed__v1__alpha;

    return {
      topic: data.pieceId,
      kind,
      data: {
        kind,
        ...data,
      },
    };
  }

  private async completed(
    event: EventData<LegacyProjectImportJobInput, LegacyProjectImportJobOutput>,
  ) {
    const { pieceId, projectId } = await event.data;
    const result = await event.result;

    await this.commandBus.execute(
      new CompleteLegacyProjectImportPiece(
        new ResourceId(projectId),
        new LegacyProjectImportComponentId(pieceId),
        result?.warnings,
      ),
    );
  }

  private async failed(event: EventData<LegacyProjectImportJobInput, unknown>) {
    const { pieceId, projectId } = await event.data;

    const result = await event.result;
    const errors: string[] = [];

    if (typeof result === 'string') errors.push(result);

    await this.commandBus.execute(
      new MarkLegacyProjectImportPieceAsFailed(
        new ResourceId(projectId),
        new LegacyProjectImportComponentId(pieceId),
        errors,
      ),
    );
  }
}
