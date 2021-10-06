import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Queue } from 'bullmq';

import { assertDefined } from '@marxan/utils';
import { ApiEventsService } from '@marxan-api/modules/api-events/api-events.service';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { JobInput } from '@marxan/planning-unit-features';

import { IntersectWithPlanningUnits } from './intersect-with-planning-units.command';
import { intersectFeaturesWithPuQueueToken } from './intersect-queue.providers';

@CommandHandler(IntersectWithPlanningUnits)
export class IntersectWithPuHandler
  implements IInferredCommandHandler<IntersectWithPlanningUnits> {
  constructor(
    @Inject(intersectFeaturesWithPuQueueToken)
    private readonly queue: Queue<JobInput>,
    private readonly apiEvents: ApiEventsService,
  ) {}

  async execute({ scenarioId }: IntersectWithPlanningUnits): Promise<void> {
    const { id } = await this.queue.add(
      `intersect-scenario-features-with-pu-${Date.now()}`,
      {
        scenarioId,
      },
    );
    assertDefined(id);
    await this.apiEvents.create({
      kind:
        API_EVENT_KINDS.scenario__featuresWithPuIntersection__submitted__v1__alpha1,
      topic: scenarioId,
      externalId: id,
      data: {},
    });
  }
}
