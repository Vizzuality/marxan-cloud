import { Inject, Injectable } from '@nestjs/common';
import { CommandBus, EventBus } from '@nestjs/cqrs';

import { JobInput, JobOutput } from '@marxan/cloning';

import { CreateApiEventDTO } from '@marxan-api/modules/api-events/dto/create.api-event.dto';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { assertDefined } from '@marxan/utils';
import {
  CreateWithEventFactory,
  EventData,
  EventFactory,
  QueueEventsAdapter,
} from '@marxan-api/modules/queue-api-events';

import { exportPieceEventsFactoryToken } from './export-queue.provider';
import {
  CompletePiece,
  ComponentId,
  ComponentLocation,
  ExportId,
} from '../../export/application/complete-piece.command';
import { ExportPieceFailed } from '../../export/application/export-piece-failed.event';

@Injectable()
export class ExportPieceEventsHandler
  implements EventFactory<JobInput, JobOutput> {
  private queueEvents: QueueEventsAdapter<JobInput, JobOutput>;

  constructor(
    @Inject(exportPieceEventsFactoryToken)
    queueEventsFactory: CreateWithEventFactory<JobInput, JobOutput>,
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus,
  ) {
    this.queueEvents = queueEventsFactory(this);
    this.queueEvents.on(`completed`, (data) => this.completed(data));
    this.queueEvents.on(`failed`, (data) => this.failed(data));
  }

  async createCompletedEvent(
    eventData: EventData<JobInput, JobOutput>,
  ): Promise<CreateApiEventDTO> {
    const data = await eventData.data;
    const output = await eventData.result;
    const kind = API_EVENT_KINDS.project__export__piece__finished__v1__alpha;
    return {
      topic: data.resourceId,
      kind,
      externalId: eventData.eventId,
      data: {
        kind,
        ...output,
      },
    };
  }

  async createFailedEvent(
    eventData: EventData<JobInput, JobOutput>,
  ): Promise<CreateApiEventDTO> {
    const data = await eventData.data;
    const output = await eventData.result;
    const kind = API_EVENT_KINDS.project__export__piece__failed__v1__alpha;
    return {
      topic: data.resourceId,
      kind,
      externalId: eventData.eventId,
      data: {
        kind,
        ...output,
      },
    };
  }

  private async completed(event: EventData<JobInput, JobOutput>) {
    const result = await event.result;
    assertDefined(result);
    await this.commandBus.execute(
      new CompletePiece(
        new ExportId(result.exportId),
        new ComponentId(result.componentId),
        result.uris.map(
          ({ uri, relativePath }) => new ComponentLocation(uri, relativePath),
        ),
      ),
    );
  }

  private async failed(event: EventData<JobInput, unknown>) {
    const { exportId, componentId } = await event.data;
    this.eventBus.publish(
      new ExportPieceFailed(
        new ExportId(exportId),
        new ComponentId(componentId),
      ),
    );
  }
}
