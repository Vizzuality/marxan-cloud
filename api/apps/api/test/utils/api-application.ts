import { AppModule } from '@marxan-api/app.module';
import { ProjectChecker } from '@marxan-api/modules/projects/project-checker/project-checker.service';
import { QueueBuilder } from '@marxan-api/modules/queue/queue.builder';
import {
  FileRepository,
  TempStorageRepository,
} from '@marxan/files-repository';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces/modules/module-metadata.interface';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { ScenarioCalibrationRepo } from '../../src/modules/blm/values/scenario-calibration-repo';
import { QueueToken } from '../../src/modules/queue/queue.tokens';
import { ProjectCheckerFake } from './project-checker.service-fake';
import { FakeQueue, FakeQueueBuilder } from './queues';
import { FakeScenarioCalibrationRepo } from './scenario-calibration-repo.test.utils';

type Overridable = { provider: any; implementation: any };
type Overrides = {
  classes: Overridable[];
  values: Overridable[];
  factories: Overridable[];
};

const defaultOverrides: Overrides = {
  classes: [
    { provider: QueueToken, implementation: FakeQueue },
    { provider: QueueBuilder, implementation: FakeQueueBuilder },
    { provider: ProjectChecker, implementation: ProjectCheckerFake },
    { provider: FileRepository, implementation: TempStorageRepository },
    {
      provider: ScenarioCalibrationRepo,
      implementation: FakeScenarioCalibrationRepo,
    },
  ],
  values: [],
  factories: [],
};

export const bootstrapApplication = async (
  imports: ModuleMetadata['imports'] = [],
  providers: ModuleMetadata['providers'] = [],
  overrides: Overrides = { classes: [], factories: [], values: [] },
): Promise<INestApplication> => {
  const { classes, values, factories } = defaultOverrides;
  const classOverrides = [...classes, ...overrides.classes];
  const valueOverrides = [...values, ...overrides.values];
  const factoryOverrides = [...factories, ...overrides.factories];

  const moduleFixtureBuilder: TestingModuleBuilder = Test.createTestingModule({
    imports: [AppModule, ...imports],
    providers: [...providers],
  });
  classOverrides.forEach(({ provider, implementation }) =>
    moduleFixtureBuilder.overrideProvider(provider).useClass(implementation),
  );
  valueOverrides.forEach(({ provider, implementation }) =>
    moduleFixtureBuilder.overrideProvider(provider).useValue(implementation),
  );
  factoryOverrides.forEach(({ provider, implementation }) =>
    moduleFixtureBuilder.overrideProvider(provider).useFactory(implementation),
  );

  const moduleFixture = await moduleFixtureBuilder.compile();

  return await moduleFixture
    .createNestApplication()
    .enableShutdownHooks()
    .useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    .init();
};
