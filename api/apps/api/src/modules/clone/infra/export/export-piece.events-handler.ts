import { Inject, Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

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

@Injectable()
export class ExportPieceEventsHandler
  implements EventFactory<JobInput, JobOutput> {
  private queueEvents: QueueEventsAdapter<JobInput, JobOutput>;

  constructor(
    @Inject(exportPieceEventsFactoryToken)
    queueEventsFactory: CreateWithEventFactory<JobInput, JobOutput>,
    private readonly commandBus: CommandBus,
  ) {
    this.queueEvents = queueEventsFactory(this);
    this.queueEvents.on(`completed`, (data) => this.completed(data));
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
}
