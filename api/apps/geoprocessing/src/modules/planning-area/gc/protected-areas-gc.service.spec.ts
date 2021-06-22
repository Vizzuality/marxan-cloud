import { ProtectedAreasGcService } from './protected-areas-gc.service';
import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleModule, SchedulerRegistry } from '@nestjs/schedule';

import { cronjobName } from './cronjob-name';
import { Executor } from './executor';
import { gcConfigToken } from './config/config.token';

let testingModule: TestingModule;
let registry: SchedulerRegistry;
let executor: jest.SpyInstance;

beforeEach(async () => {
  executor = jest.fn();

  const sandbox = await Test.createTestingModule({
    imports: [ScheduleModule.forRoot()],
    providers: [
      {
        provide: Executor,
        useValue: {
          run: executor,
        },
      },
      {
        provide: gcConfigToken,
        useValue: {
          enabled: true,
          cronExpression: '4 5 * * * *',
          readyToCollect: () => true,
        },
      },
      ProtectedAreasGcService,
    ],
  }).compile();
  testingModule = await sandbox.init();
  registry = testingModule.get(SchedulerRegistry);
});

afterAll(async () => {
  await testingModule.close();
});

describe(`when time has come`, () => {
  beforeEach(() => {
    registry.getCronJob(cronjobName).fireOnTick();
  });

  it(`should execute the job process`, () => {
    expect(executor).toHaveBeenCalled();
  });
});
