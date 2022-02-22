import { CreateApiEventDTO } from '@marxan-api/modules/api-events/dto/create.api-event.dto';
import {
  CreateWithEventFactory,
  EventData,
  EventFactory,
  QueueEventsAdapter,
} from '@marxan-api/modules/queue-api-events';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ImportJobInput, ImportJobOutput } from '@marxan/cloning';
import { ComponentId, ResourceKind } from '@marxan/cloning/domain';
import { assertDefined } from '@marxan/utils';
import { Inject, Injectable } from '@nestjs/common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { ApiEventsService } from '../../../api-events';
import { CompleteImportPiece } from '../../import/application/complete-import-piece.command';
import { ImportPieceFailed } from '../../import/application/import-piece-failed.event';
import { ImportId } from '../../import/domain';
import { importPieceEventsFactoryToken } from './import-queue.provider';

@Injectable()
export class ImportPieceEventsHandler
  implements EventFactory<ImportJobInput, ImportJobOutput> {
  private queueEvents: QueueEventsAdapter<ImportJobInput, ImportJobOutput>;

  private failEventsMapper: Record<ResourceKind, API_EVENT_KINDS> = {
    project: API_EVENT_KINDS.project__import__piece__failed__v1__alpha,
    scenario: API_EVENT_KINDS.scenario__import__piece__failed__v1__alpha,
  };

  private successEventsMapper: Record<ResourceKind, API_EVENT_KINDS> = {
    project: API_EVENT_KINDS.project__import__piece__finished__v1__alpha,
    scenario: API_EVENT_KINDS.scenario__import__piece__finished__v1__alpha,
  };

  constructor(
    @Inject(importPieceEventsFactoryToken)
    queueEventsFactory: CreateWithEventFactory<ImportJobInput, ImportJobOutput>,
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus,
  ) {
    this.queueEvents = queueEventsFactory(this);
    this.queueEvents.on(`completed`, (data) => this.completed(data));
    this.queueEvents.on(`failed`, (data) => this.failed(data));
  }

  async createCompletedEvent(
    eventData: EventData<ImportJobInput, ImportJobOutput>,
  ): Promise<CreateApiEventDTO> {
    const data = await eventData.data;
    const output = await eventData.result;
    const kind = this.successEventsMapper[data.resourceKind];

    return {
      topic: data.componentId,
      kind,
      externalId: ApiEventsService.composeExternalId(data.componentId, kind),
      data: {
        kind,
        ...output,
      },
    };
  }

  async createFailedEvent(
    eventData: EventData<ImportJobInput, ImportJobOutput>,
  ): Promise<CreateApiEventDTO> {
    const {
      importResourceId,
      componentResourceId,
      resourceKind,
      importId,
      componentId,
      piece,
    } = await eventData.data;
    const kind = this.failEventsMapper[resourceKind];

    return {
      topic: componentId,
      kind,
      externalId: ApiEventsService.composeExternalId(componentId, kind),
      data: {
        importId,
        importResourceId,
        componentResourceId,
        resourceKind,
        componentId,
        piece,
      },
    };
  }

  private async completed(event: EventData<ImportJobInput, ImportJobOutput>) {
    const result = await event.result;
    assertDefined(result);
    await this.commandBus.execute(
      new CompleteImportPiece(
        new ImportId(result.importId),
        new ComponentId(result.componentId),
      ),
    );
  }

  private async failed(event: EventData<ImportJobInput, unknown>) {
    const { importId, componentId } = await event.data;
    this.eventBus.publish(
      new ImportPieceFailed(
        new ImportId(importId),
        new ComponentId(componentId),
      ),
    );
  }
}
