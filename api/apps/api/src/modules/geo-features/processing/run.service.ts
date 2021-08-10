import { Inject } from '@nestjs/common';
import { Queue } from 'bullmq';
import {
  CopyJobData,
  SplitJobData,
  StratificationJobData,
} from '@marxan/geofeature-calculations';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ApiEventsService } from '@marxan-api/modules/api-events/api-events.service';
import {
  copyQueueToken,
  splitQueueToken,
  stratificationQueueToken,
} from './queue-providers';

export class RunService {
  constructor(
    @Inject(copyQueueToken)
    private readonly copyQueue: Queue<CopyJobData>,
    @Inject(splitQueueToken)
    private readonly splitQueue: Queue<SplitJobData>,
    @Inject(stratificationQueueToken)
    private readonly stratificationQueue: Queue<StratificationJobData>,
    private readonly apiEvents: ApiEventsService,
  ) {}

  async runCopy(data: CopyJobData) {
    const job = await this.copyQueue.add(`run`, data);
    const kind =
      API_EVENT_KINDS.scenario__geofeatureCopy__submitted__v1__alpha1;
    await this.apiEvents.create({
      externalId: job.id + kind,
      kind,
      topic: data.scenarioId,
      data: {
        kind,
        featureId: data.featureId,
      },
    });
  }

  async runSplit(data: SplitJobData) {
    const job = await this.splitQueue.add(`run`, data);
    const kind =
      API_EVENT_KINDS.scenario__geofeatureSplit__submitted__v1__alpha1;
    await this.apiEvents.create({
      externalId: job.id + kind,
      kind,
      topic: data.scenarioId,
      data: {
        kind,
        featureId: data.featureId,
      },
    });
  }

  async runStratification(data: StratificationJobData) {
    const job = await this.stratificationQueue.add(`run`, data);
    const kind =
      API_EVENT_KINDS.scenario__geofeatureStratification__submitted__v1__alpha1;
    await this.apiEvents.create({
      externalId: job.id + kind,
      kind,
      topic: data.scenarioId,
      data: {
        kind,
        featureId: data.featureId,
      },
    });
  }
}
