import { Server } from 'http';
import {
  FactoryProvider,
  INestApplication,
  ValidationPipe,
  ValueProvider,
} from '@nestjs/common';
import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { AppModule } from '@marxan-api/app.module';
import { QueueToken } from '@marxan-api/modules/queue/queue.tokens';
import { FakeQueue, FakeQueueBuilder } from '../test/utils/queues';
import { QueueBuilder } from '@marxan-api/modules/queue';
import { ProjectChecker } from '@marxan-api/modules/projects/project-checker/project-checker.service';
import { ProjectCheckerFake } from '../test/utils/project-checker.service-fake';
import { ScenarioChecker } from '@marxan-api/modules/scenarios/scenario-checker/scenario-checker.service';
import { ScenarioCheckerFake } from '../test/utils/scenario-checker.service-fake';
import {
  FileRepository,
  TempStorageRepository,
} from '@marxan/files-repository';
import { ScenarioCalibrationRepo } from '@marxan-api/modules/blm/values/scenario-calibration-repo';
import { FakeScenarioCalibrationRepo } from '../test/utils/scenario-calibration-repo.test.utils';
import { ClassProvider } from '@nestjs/common/interfaces/modules/provider.interface';
import * as request from 'supertest';
import { E2E_CONFIG } from './e2e.config';
import { CommandBus } from '@nestjs/cqrs';
import { SetProjectBlm } from '@marxan-api/modules/projects/blm/set-project-blm';

type Overrides = {
  classes: ClassProvider[];
  values: ValueProvider[];
  factories: FactoryProvider[];
};

export class TestClientApi {
  private app!: Server;

  private moduleRef!: TestingModule;

  private static apps: INestApplication[] = [];

  private static addAppInstance(app: INestApplication) {
    this.apps.push(app);
  }

  public static async teardownApps() {
    for await (const app of this.apps) {
      app.close();
    }
  }

  async initialize(overrides: Overrides) {
    const testingModuleBuilder = Test.createTestingModule({
      imports: [AppModule],
    });

    this.overrideProviders(testingModuleBuilder, overrides);
    this.moduleRef = await testingModuleBuilder.compile();

    const nestApplication: INestApplication = this.moduleRef.createNestApplication();
    nestApplication.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await nestApplication.init();

    TestClientApi.addAppInstance(nestApplication);

    this.app = nestApplication.getHttpServer();
  }

  private overrideProviders(
    module: TestingModuleBuilder,
    overrides: Overrides,
  ) {
    const defaultOverrides: Overrides = {
      classes: [
        { provide: QueueToken, useClass: FakeQueue },
        { provide: QueueBuilder, useClass: FakeQueueBuilder },
        { provide: ProjectChecker, useClass: ProjectCheckerFake },
        { provide: ScenarioChecker, useClass: ScenarioCheckerFake },
        { provide: FileRepository, useClass: TempStorageRepository },
        {
          provide: ScenarioCalibrationRepo,
          useClass: FakeScenarioCalibrationRepo,
        },
      ],
      values: [],
      factories: [],
    };
    const { classes, values, factories } = defaultOverrides;
    const classOverrides = [...classes, ...overrides.classes];
    const valueOverrides = [...values, ...overrides.values];
    const factoryOverrides = [...factories, ...overrides.factories];

    classOverrides.forEach(({ provide, useClass }) =>
      module.overrideProvider(provide).useClass(useClass),
    );
    valueOverrides.forEach(({ provide, useValue }) =>
      module.overrideProvider(provide).useValue(useValue),
    );
    factoryOverrides.forEach(({ provide, useFactory }) =>
      module
        .overrideProvider(provide)
        .useFactory({ factory: (args) => useFactory(...args) }),
    );
  }
  //----------------------//
  // API Endpoint helpers //
  //----------------------//

  // Users
  public registerUser(
    { username, password } = {
      username: 'user@email.com',
      password: 'password',
    },
  ) {
    return request(this.app).post('/auth/sign-in').send({
      username,
      password,
    });
  }

  // Organizations
  public createOrganization(
    jwt: string,
    data = E2E_CONFIG.organizations.valid.minimal(),
  ) {
    return request(this.app)
      .post('/api/v1/organizations')
      .auth(jwt, { type: 'bearer' })
      .send(data);
  }

  // Projects
  public createProject(
    jwt: string,
    data = E2E_CONFIG.projects.valid.minimal(),
  ) {
    return request(this.app)
      .post('/api/v1/projects')
      .auth(jwt, { type: 'bearer' })
      .send(data);
  }

  // Scenarios
  public createScenario(
    jwt: string,
    data = E2E_CONFIG.scenarios.valid.minimal(),
  ) {
    return request(this.app)
      .post('/api/v1/scenarios')
      .auth(jwt, { type: 'bearer' })
      .send(data);
  }

  // Utils
  public async generateProjectBlmValues(projectId: string) {
    const commandBus = this.moduleRef.get(CommandBus);
    await commandBus.execute(new SetProjectBlm(projectId));
  }
}

export async function createClient(
  overrides: Overrides = { classes: [], factories: [], values: [] },
) {
  const client = new TestClientApi();

  await client.initialize(overrides);

  return client;
}
