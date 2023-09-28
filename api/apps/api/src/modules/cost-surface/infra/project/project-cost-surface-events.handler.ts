import { CreateApiEventDTO } from '@marxan-api/modules/api-events/dto/create.api-event.dto';
import {
  CreateWithEventFactory,
  EventData,
  EventFactory,
  QueueEventsAdapter,
} from '@marxan-api/modules/queue-api-events';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { Inject, Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteProject } from '@marxan-api/modules/projects/delete-project/delete-project.command';
import {
  FromProjectShapefileJobInput,
  ProjectCostSurfaceJobInput,
} from '@marxan/artifact-cache/surface-cost-job-input';
import { ProjectCostSurfaceFactoryToken } from '@marxan-api/modules/cost-surface/infra/project/project-cost-surface-queue.provider';

type EventKind = { event: API_EVENT_KINDS };

@Injectable()
export class ProjectCostSurfaceEventsHandler
  implements EventFactory<ProjectCostSurfaceJobInput, true>
{
  private queueEvents: QueueEventsAdapter<ProjectCostSurfaceJobInput, true>;

  // TODO!!! Create proper events

  private failEventsMapper: EventKind = {
    event: API_EVENT_KINDS.project__costSurface_shapefile_failed__v1alpha1,
  };

  private successEventsMapper: EventKind = {
    event: API_EVENT_KINDS.project__costSurface_shapefile_finished__v1alpha1,
  };

  constructor(
    @Inject(ProjectCostSurfaceFactoryToken)
    queueEventsFactory: CreateWithEventFactory<
      ProjectCostSurfaceJobInput,
      true
    >,
    private readonly commandBus: CommandBus,
  ) {
    this.queueEvents = queueEventsFactory(this);
    this.queueEvents.on('failed', (data) => this.failed(data));
  }

  async createCompletedEvent(
    eventData: EventData<ProjectCostSurfaceJobInput, true>,
  ): Promise<CreateApiEventDTO> {
    const data = await eventData.data;
    const kind = this.successEventsMapper.event;

    return {
      topic: data.projectId,
      kind,
      data: {},
    };
  }

  async createFailedEvent(
    eventData: EventData<ProjectCostSurfaceJobInput, true>,
  ): Promise<CreateApiEventDTO> {
    const data = await eventData.data;
    const kind = this.failEventsMapper.event;

    return {
      topic: data.projectId,
      kind,
      data: {},
    };
  }

  async failed(
    eventData: EventData<ProjectCostSurfaceJobInput, unknown>,
  ): Promise<void> {
    const jobInput = await eventData.data;

    const isFromShapefileJob = Boolean(
      (jobInput as FromProjectShapefileJobInput).shapefile,
    );
    if (!isFromShapefileJob) {
      await this.commandBus.execute(new DeleteProject(jobInput.projectId));
    }
  }
}
