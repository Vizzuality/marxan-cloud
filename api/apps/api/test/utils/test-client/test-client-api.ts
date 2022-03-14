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
import { QueueBuilder } from '@marxan-api/modules/queue';
import { ProjectChecker } from '@marxan-api/modules/projects/project-checker/project-checker.service';
import { ScenarioChecker } from '@marxan-api/modules/scenarios/scenario-checker/scenario-checker.service';
import {
  FileRepository,
  TempStorageRepository,
} from '@marxan/files-repository';
import { ScenarioCalibrationRepo } from '@marxan-api/modules/blm/values/scenario-calibration-repo';
import { ClassProvider } from '@nestjs/common/interfaces/modules/provider.interface';
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
import { ProjectCheckerFake } from '../project-checker.service-fake';
import { FakeQueue, FakeQueueBuilder } from '../queues';
import { FakeScenarioCalibrationRepo } from '../scenario-calibration-repo.test.utils';
import { ScenarioRequests } from './requests/scenario-requests';
import { UserRequests } from './requests/user-requests';
import { ScenarioCheckerFake } from '../scenario-checker.service-fake';
import { ProjectRequests } from './requests/project-requests';
import { OrganizationRequests } from './requests/organization-requests';
import { E2E_CONFIG } from '../../e2e.config';

type Overrides = {
  classes: ClassProvider[];
  values: ValueProvider[];
  factories: FactoryProvider[];
};

export class TestClientApi {
  public static defaultOverrides: Overrides = {
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
  private static emptyOverrides: Overrides = {
    classes: [],
    values: [],
    factories: [],
  };
  private readonly app: Server;

  private moduleRef: TestingModule;

  private nestInstance: INestApplication;

  public static apps: INestApplication[] = [];

  private static addAppInstance(app: INestApplication) {
    this.apps.push(app);
  }

  public static async teardownApps() {
    for await (const app of this.apps) {
      app.close();
    }
    this.apps = [];
  }
  public static async initialize(overrides = TestClientApi.emptyOverrides) {
    const testingModuleBuilder = Test.createTestingModule({
      imports: [AppModule],
    });

    const { classes, factories, values } = TestClientApi.defaultOverrides;
    overrideProviders(testingModuleBuilder, {
      classes: [...classes, ...overrides.classes],
      factories: [...factories, ...overrides.factories],
      values: [...values, ...overrides.values],
    });

    const moduleRef = await testingModuleBuilder.compile();
    const nestApplication: INestApplication = moduleRef.createNestApplication();
    nestApplication.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await nestApplication.init();
    TestClientApi.addAppInstance(nestApplication);

    const app = nestApplication.getHttpServer();

    return new TestClientApi(app, moduleRef, nestApplication);
  }
  private constructor(
    app: Server,
    moduleRef: TestingModule,
    nestInstance: INestApplication,
  ) {
    this.app = app;
    this.moduleRef = moduleRef;
    this.nestInstance = nestInstance;
    this.requests = {
      projects: new ProjectRequests(app),
      scenarios: new ScenarioRequests(app),
      organizations: new OrganizationRequests(app),
      users: new UserRequests(app),
    };
  }

  //-----------------------//
  // API Endpoint requests //
  //-----------------------//

  public readonly requests: {
    organizations: OrganizationRequests;
    projects: ProjectRequests;
    scenarios: ScenarioRequests;
    users: UserRequests;
  };

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
      const {
        body: organizationResponse,
      } = await this.requests.organizations
        .createOrganization(jwt, E2E_CONFIG.organizations.valid.minimal())
        .expect(HttpStatus.CREATED);

      const { body: projectResponse } = await this.requests.projects
        .createProject(jwt, {
          ...data,
          organizationId: organizationResponse.data.id,
        })
        .expect(HttpStatus.CREATED);
      await this.utils.generateProjectBlmValues(projectResponse.data.id);

      return projectResponse;
    },

    createWorkingProjectWithScenario: async (
      jwt: string,
      projectData = E2E_CONFIG.projects.valid.minimal(),
      scenarioData = E2E_CONFIG.scenarios.valid.minimal(),
    ) => {
      const {
        body: organizationResponse,
      } = await this.requests.organizations
        .createOrganization(jwt, E2E_CONFIG.organizations.valid.minimal())
        .expect(HttpStatus.CREATED);

      const { body: projectResponse } = await this.requests.projects
        .createProject(jwt, {
          ...projectData,
          organizationId: organizationResponse.data.id,
        })
        .expect(HttpStatus.CREATED);
      await this.utils.generateProjectBlmValues(projectResponse.data.id);
      await this.requests.scenarios.createScenario(jwt, {
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

      await this.requests.users
        .validateUser({ validationToken, sub: user.id })
        .expect(HttpStatus.CREATED);
    },
    createWorkingUser: async ({
      email = 'user@email.com',
      password = 'password',
      displayName = undefined as string | undefined,
    } = {}) => {
      await this.requests.users
        .registerUser({
          email,
          password,
          displayName,
        })
        .expect(HttpStatus.CREATED);
      await this.utils.validateUserWithEmail(email);
      const { body } = await this.requests.users
        .login({ username: email, password })
        .expect(HttpStatus.CREATED);

      return body.accessToken;
    },
  };
}

const overrideProviders = (
  module: TestingModuleBuilder,
  overrides: Overrides,
) => {
  const { classes, values, factories } = overrides;

  classes.forEach(({ provide, useClass }) =>
    module.overrideProvider(provide).useClass(useClass),
  );
  values.forEach(({ provide, useValue }) =>
    module.overrideProvider(provide).useValue(useValue),
  );
  factories.forEach(({ provide, useFactory }) =>
    module
      .overrideProvider(provide)
      .useFactory({ factory: (args) => useFactory(...args) }),
  );
};
