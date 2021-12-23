import { Inject, Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { JobData } from '@marxan/scenario-run-queue';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { assertDefined } from '@marxan/utils';
import { ApiEventsService } from '@marxan-api/modules/api-events/api-events.service';
import { Scenario } from '../scenario.api.entity';
import { blmDefaultToken, runQueueToken } from './tokens';
import { AssetsService } from './assets.service';

@Injectable()
export class RunHandler {
  constructor(
    @Inject(runQueueToken)
    private readonly queue: Queue<JobData>,
    private readonly apiEvents: ApiEventsService,
    @InjectRepository(Scenario)
    private readonly scenarios: Repository<Scenario>,
    private readonly assets: AssetsService,
    @Inject(blmDefaultToken)
    private readonly blmDefault: number,
  ) {}

  async run(
    scenario: {
      id: string;
      boundaryLengthModifier?: number;
    },
    overridingBlm?: number,
  ): Promise<void> {
    const blm =
      overridingBlm ?? scenario.boundaryLengthModifier ?? this.blmDefault;
    const assets = await this.assets.forScenario(scenario.id, blm);
    assertDefined(assets);
    const job = await this.queue.add(`run-scenario`, {
      scenarioId: scenario.id,
      assets,
    });
    await this.scenarios.update(scenario.id, {
      ranAtLeastOnce: true,
    });
    const kind = API_EVENT_KINDS.scenario__run__submitted__v1__alpha1;
    await this.apiEvents.create({
      topic: scenario.id,
      kind,
      externalId: job.id + kind,
    });
  }
}
