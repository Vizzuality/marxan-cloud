import { CreateApiEventDTO } from '@marxan-api/modules/api-events/dto/create.api-event.dto';
import {
  CreateWithEventFactory,
  EventData,
  EventFactory,
  QueueEventsAdapter,
} from '@marxan-api/modules/queue-api-events';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ExportJobInput, ExportJobOutput } from '@marxan/cloning';
import {
  ComponentId,
  ComponentLocation,
  ResourceKind,
} from '@marxan/cloning/domain';
import { assertDefined } from '@marxan/utils';
import { Inject, Injectable } from '@nestjs/common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { ApiEventsService } from '../../../api-events';
import { ExportId } from '../../export';
import { CompleteExportPiece } from '../../export/application/complete-export-piece.command';
import { ExportPieceFailed } from '../../export/application/export-piece-failed.event';
import { exportPieceEventsFactoryToken } from './export-queue.provider';

@Injectable()
export class ExportPieceEventsHandler
  implements EventFactory<ExportJobInput, ExportJobOutput> {
  private queueEvents: QueueEventsAdapter<ExportJobInput, ExportJobOutput>;

  private failEventsMapper: Record<ResourceKind, API_EVENT_KINDS> = {
    project: API_EVENT_KINDS.project__export__piece__failed__v1__alpha,
    scenario: API_EVENT_KINDS.scenario__export__piece__failed__v1__alpha,
  };

  private successEventsMapper: Record<ResourceKind, API_EVENT_KINDS> = {
    project: API_EVENT_KINDS.project__export__piece__finished__v1__alpha,
    scenario: API_EVENT_KINDS.scenario__export__piece__finished__v1__alpha,
  };

  constructor(
    @Inject(exportPieceEventsFactoryToken)
    queueEventsFactory: CreateWithEventFactory<ExportJobInput, ExportJobOutput>,
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus,
  ) {
    this.queueEvents = queueEventsFactory(this);
    this.queueEvents.on(`completed`, (data) => this.completed(data));
    this.queueEvents.on(`failed`, (data) => this.failed(data));
  }

  async createCompletedEvent(
    eventData: EventData<ExportJobInput, ExportJobOutput>,
  ): Promise<CreateApiEventDTO> {
    const data = await eventData.data;
    const output = await eventData.result;
    const kind = this.successEventsMapper[data.resourceKind];

    return {
      topic: data.componentId,
      kind,
      data: {
        kind,
        ...output,
      },
    };
  }

  async createFailedEvent(
    eventData: EventData<ExportJobInput, ExportJobOutput>,
  ): Promise<CreateApiEventDTO> {
    const {
      resourceId,
      resourceKind,
      exportId,
      componentId,
      piece,
    } = await eventData.data;
    const kind = this.failEventsMapper[resourceKind];

    return {
      topic: componentId,
      kind,
      data: {
        exportId,
        resourceId,
        resourceKind,
        componentId,
        piece,
      },
    };
  }

  private async completed(event: EventData<ExportJobInput, ExportJobOutput>) {
    const result = await event.result;
    assertDefined(result);
    await this.commandBus.execute(
      new CompleteExportPiece(
        new ExportId(result.exportId),
        new ComponentId(result.componentId),
        result.uris.map(
          ({ uri, relativePath }) => new ComponentLocation(uri, relativePath),
        ),
      ),
    );
  }

  private async failed(event: EventData<ExportJobInput, unknown>) {
    const { exportId, componentId } = await event.data;
    this.eventBus.publish(
      new ExportPieceFailed(
        new ExportId(exportId),
        new ComponentId(componentId),
      ),
    );
  }
}
