import { Inject } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { left, right, Either } from 'fp-ts/Either';
import {
  CopyJobData,
  FeaturesJobData,
  FeaturesJobProgress,
  SplitJobData,
  StratificationJobData,
} from '@marxan/geofeature-calculations';
import {
  API_EVENT_KINDS,
  ScenarioGeofeatureEventValues,
} from '@marxan/api-events';
import { isDefined } from '@marxan/utils';
import { ApiEventsService } from '@marxan-api/modules/api-events/api-events.service';
import {
  copyQueueToken,
  splitQueueToken,
  stratificationQueueToken,
} from './queue-providers';
export const notFound = Symbol('not found');
export type NotFound = typeof notFound;

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
    await this.run(
      this.copyQueue,
      data,
      API_EVENT_KINDS.scenario__geofeatureCopy__submitted__v1__alpha1,
    );
  }

  async cancelCopy(data: FeaturesJobData): Promise<Either<NotFound, void>> {
    return await this.cancel(this.copyQueue, data);
  }

  async runSplit(data: SplitJobData) {
    await this.run(
      this.splitQueue,
      data,
      API_EVENT_KINDS.scenario__geofeatureSplit__submitted__v1__alpha1,
    );
  }

  async cancelSplit(data: FeaturesJobData): Promise<Either<NotFound, void>> {
    return await this.cancel(this.splitQueue, data);
  }

  async runStratification(data: StratificationJobData) {
    await this.run(
      this.stratificationQueue,
      data,
      API_EVENT_KINDS.scenario__geofeatureStratification__submitted__v1__alpha1,
    );
  }

  async cancelStratification(
    data: FeaturesJobData,
  ): Promise<Either<NotFound, void>> {
    return await this.cancel(this.stratificationQueue, data);
  }

  private async run(
    queue: Queue<FeaturesJobData>,
    data: FeaturesJobData,
    kind: ScenarioGeofeatureEventValues,
  ) {
    const job = await queue.add(`run`, data);
    await this.apiEvents.create({
      kind,
      topic: data.scenarioId,
      data: {
        kind,
        featureId: data.featureId,
      },
    });
  }

  private async cancel(
    queue: Queue<FeaturesJobData>,
    data: FeaturesJobData,
  ): Promise<Either<NotFound, void>> {
    const activeJobs: Job<FeaturesJobData>[] = await queue.getJobs([
      'active',
      'waiting',
    ]);
    const job = activeJobs.find(
      (job) =>
        job.data.featureId === data.featureId &&
        job.data.scenarioId === data.scenarioId,
    );
    if (!isDefined(job)) return left(notFound);

    if (await job.isWaiting()) await job.remove();
    if (await job.isActive()) {
      const cancellingProgress: FeaturesJobProgress = {
        type: 'canceled',
        canceled: true,
        featureId: data.featureId,
        scenarioId: data.scenarioId,
        specificationId: data.specificationId,
      };
      await job.updateProgress(cancellingProgress);
    }

    return right(void 0);
  }
}
