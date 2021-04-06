import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { Job, Queue, QueueEvents } from 'bullmq';
import { v4 } from 'uuid';
import defaultExport, {PlanningUnitsJob } from '../src/modules/planning-units/planning-units.job';
import * as child from 'child_process';

import { E2E_CONFIG } from './e2e.config';

const logger: Logger = new Logger('planning units jobs (e2e)')

describe('planning units jobs (e2e)', () => {
  let queue: Queue;
  let queueEvents: QueueEvents;
  let queueName: string;
  beforeEach(async function() {
    queueName = 'test-' + v4();
    queue = new Queue(queueName);
    queueEvents = new QueueEvents(queueName);
    await queueEvents.waitUntilReady();
  });

  afterEach(async () => {
    await queue.close();
    await queueEvents.close();
  });

  it('executes the child job processor with mock data', () => {
    const createPlanningUnitsDTO: Partial<Job> = {data: E2E_CONFIG.planningUnits.creationJob.valid.customArea({ countryCode: 'NAM' })};
    const value = defaultExport(createPlanningUnitsDTO);
    // var foo: child.ChildProcess = child.exec('src/modules/planning-units/planning-units.job');
    logger.debug(value);
  });
});
