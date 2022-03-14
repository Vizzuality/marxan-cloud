import { Server } from 'http';
import {
  FactoryProvider,
  HttpStatus,
  INestApplication,
  ValidationPipe,
  ValueProvider,
} from '@nestjs/common';
import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { AppModule } from '@marxan-api/app.module';
import { QueueToken } from '@marxan-api/modules/queue/queue.tokens';
import { FakeQueue, FakeQueueBuilder } from '../utils/queues';
import { QueueBuilder } from '@marxan-api/modules/queue';
import { ProjectChecker } from '@marxan-api/modules/projects/project-checker/project-checker.service';
import { ProjectCheckerFake } from '../utils/project-checker.service-fake';
import { ScenarioChecker } from '@marxan-api/modules/scenarios/scenario-checker/scenario-checker.service';
import { ScenarioCheckerFake } from '../utils/scenario-checker.service-fake';
import {
  FileRepository,
  TempStorageRepository,
} from '@marxan/files-repository';
import { ScenarioCalibrationRepo } from '@marxan-api/modules/blm/values/scenario-calibration-repo';
import { FakeScenarioCalibrationRepo } from '../utils/scenario-calibration-repo.test.utils';
import { ClassProvider } from '@nestjs/common/interfaces/modules/provider.interface';
import * as request from 'supertest';
import { E2E_CONFIG } from '../e2e.config';
import { CommandBus } from '@nestjs/cqrs';
import { SetProjectBlm } from '@marxan-api/modules/projects/blm/set-project-blm';
import {
  FakeMailer,
  Mailer,
} from '@marxan-api/modules/authentication/password-recovery/mailer';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '@marxan-api/modules/users/user.api.entity';
import { Repository } from 'typeorm';
import { ProjectResultSingular } from '@marxan-api/modules/projects/project.api.entity';

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
        { provide: Mailer, useClass: FakeMailer },
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
  public registerUser({
    email = 'user@email.com',
    password = 'password',
    displayName = undefined as string | undefined,
  } = {}) {
    return request(this.app).post('/auth/sign-up').send({
      email,
      password,
      displayName,
    });
  }

  public login({ username = 'user@email.com', password = 'password' } = {}) {
    return request(this.app).post('/auth/sign-in').send({
      username,
      password,
    });
  }

  public validateUser({
    validationToken = 'token',
    sub = 'user@email.com',
  } = {}) {
    return request(this.app).post('/auth/validate').send({
      sub,
      validationToken,
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

  public listProjects(
    jwt: string,
    query: { include: Array<'users' | 'scenarios'> } = { include: [] },
  ) {
    return request(this.app)
      .get('/api/v1/projects')
      .query(query)
      .auth(jwt, { type: 'bearer' });
  }

  public deleteProject(jwt: string, projectId: string) {
    return request(this.app)
      .delete(`/api/v1/projects/${projectId}`)
      .auth(jwt, { type: 'bearer' });
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

  //--------//
  // Utils //
  //-------//

  public readonly utils = {
    // Projects
    generateProjectBlmValues: async (projectId: string) => {
      const commandBus = this.moduleRef.get(CommandBus);
      await commandBus.execute(new SetProjectBlm(projectId));
    },
    createWorkingProject: async (
      jwt: string,
      data = E2E_CONFIG.projects.valid.minimal(),
    ): Promise<ProjectResultSingular> => {
      const { body: organizationResponse } = await this.createOrganization(
        jwt,
        E2E_CONFIG.organizations.valid.minimal(),
      ).expect(HttpStatus.CREATED);

      const { body: projectResponse } = await this.createProject(jwt, {
        ...data,
        organizationId: organizationResponse.data.id,
      }).expect(HttpStatus.CREATED);
      await this.utils.generateProjectBlmValues(projectResponse.data.id);

      return projectResponse;
    },

    createWorkingProjectWithScenario: async (
      jwt: string,
      projectData = E2E_CONFIG.projects.valid.minimal(),
      scenarioData = E2E_CONFIG.scenarios.valid.minimal(),
    ) => {
      const { body: organizationResponse } = await this.createOrganization(
        jwt,
        E2E_CONFIG.organizations.valid.minimal(),
      ).expect(HttpStatus.CREATED);

      const { body: projectResponse } = await this.createProject(jwt, {
        ...projectData,
        organizationId: organizationResponse.data.id,
      }).expect(HttpStatus.CREATED);
      await this.utils.generateProjectBlmValues(projectResponse.data.id);
      await this.createScenario(jwt, {
        ...scenarioData,
        projectId: projectResponse.data.id,
      });

      return projectResponse;
    },

    // Users
    validateUserWithEmail: async (email: string) => {
      const mailer = this.moduleRef.get(Mailer) as FakeMailer;
      const userRepository: Repository<User> = this.moduleRef.get(
        getRepositoryToken(User),
      );
      const user = await userRepository.findOneOrFail({ email });
      const validationToken = mailer.confirmationTokens[user.id];

      await this.validateUser({ validationToken, sub: user.id }).expect(
        HttpStatus.CREATED,
      );
    },
    createWorkingUser: async ({
      email = 'user@email.com',
      password = 'password',
      displayName = undefined as string | undefined,
    } = {}) => {
      await this.registerUser({ email, password, displayName }).expect(
        HttpStatus.CREATED,
      );
      await this.utils.validateUserWithEmail(email);
      const { body } = await this.login({ username: email, password }).expect(
        HttpStatus.CREATED,
      );

      return body.accessToken;
    },
  };
}

export async function createClient(
  overrides: Overrides = { classes: [], factories: [], values: [] },
) {
  const client = new TestClientApi();

  await client.initialize(overrides);

  return client;
}
