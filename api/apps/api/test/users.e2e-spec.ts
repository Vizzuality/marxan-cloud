import { HttpStatus, INestApplication } from '@nestjs/common';
import * as faker from 'faker';
import * as request from 'supertest';
import { E2E_CONFIG } from './e2e.config';
import { v4 } from 'uuid';
import { SignUpDto } from '@marxan-api/modules/authentication/dto/sign-up.dto';
import { User } from '@marxan-api/modules/users/user.api.entity';
import { ApiEventsService } from '@marxan-api/modules/api-events/api-events.service';
import { UsersService } from '@marxan-api/modules/users/users.service';
import { LoginDto } from '@marxan-api/modules/authentication/dto/login.dto';
import { ApiEventByTopicAndKind } from '@marxan-api/modules/api-events/api-event.topic+kind.api.entity';
import { tearDown } from './utils/tear-down';
import { API_EVENT_KINDS } from '@marxan/api-events';
import * as nock from 'nock';
import { CreateTransmission, Recipient } from 'sparkpost';
import { AppConfig } from '@marxan-api/utils/config.utils';
import { bootstrapApplication } from './utils/api-application';
import { GivenUserIsLoggedIn } from './steps/given-user-is-logged-in';
import { GivenUserExists } from './steps/given-user-exists';
import { GivenUserIsCreated } from './steps/given-user-is-created';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

nock.disableNetConnect();
nock.enableNetConnect(process.env.HOST_IP);

/**
 * Tests for the UsersModule.
 *
 * Given that we create user accounts, update user data, reset passwords, delete
 * accounts and recreate them, the tests in this file rely on a different setup
 * than what we use in most other e2e test files.
 *
 * Authentication is split off app setup, and is executed in `beforeAll()`
 * callbacks in individual `describe()` blocks.
 *
 * Please be mindful of this when adding new tests or updating existing ones.
 */

afterAll(async () => {
  await tearDown();
});

describe('UsersModule (e2e)', () => {
  let app: INestApplication;
  let apiEventsService: ApiEventsService;
  let usersService: UsersService;
  let usersRepo: Repository<User>;

  const aNewPassword = faker.random.uuid();

  const signUpDto: SignUpDto = {
    email: `${v4()}@example.com`,
    password: v4(),
    displayName: `${faker.name.firstName()} ${faker.name.lastName()}`,
  };

  const loginDto: LoginDto = {
    username: signUpDto.email,
    password: signUpDto.password,
  };

  const mockAccountActivation = () => {
    nock('https://api.eu.sparkpost.com')
      .post(`/api/v1/transmissions`, (body: CreateTransmission) => {
        const recipients = body.recipients as Recipient[];
        return recipients
          .map((el) => el.substitution_data)
          .every(
            (el) =>
              el.urlSignUpConfirmation.includes(
                AppConfig.get('application.baseUrl'),
              ) &&
              el.urlSignUpConfirmation.includes(
                AppConfig.get('signUpConfirmation.tokenPrefix'),
              ) &&
              el.urlSignUpConfirmation.match(/&userId=\w+/),
          );
      })
      .reply(200);
  };

  beforeAll(async () => {
    app = await bootstrapApplication();
    usersRepo = app.get(getRepositoryToken(User));

    apiEventsService = app.get<ApiEventsService>(ApiEventsService);
    usersService = app.get<UsersService>(UsersService);
  });

  afterAll(async () => {
    await Promise.all([app.close()]);
  });

  describe('Users - sign up and validation', () => {
    let newUser: User | undefined;
    let validationTokenEvent: ApiEventByTopicAndKind | undefined;

    test('A user should be able to create an account using an email address not currently in use', async () => {
      mockAccountActivation();

      await request(app.getHttpServer())
        .post('/auth/sign-up')
        .send(signUpDto)
        .expect(HttpStatus.CREATED);
    });

    test('A user should not be able to create an account using an email address already in use', async () => {
      /**
       * We should handle this explicitly in the API - until then, this should
       * throw a 500 error.
       */
      await request(app.getHttpServer())
        .post('/auth/sign-up')
        .send(signUpDto)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    test('A user should not be able to log in until their account has been validated', async () => {
      await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send(loginDto)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    test('A user should be able to validate their account (within the validity timeframe of the validationToken)', async () => {
      /**
       * Here we need to dig into the actual database to retrieve both the id
       * assigned to the user when their account is created, and the one-time
       * token that they would normally receive via email as part of the account
       * validation/email confirmation workflow.
       */
      newUser = await usersService.findByEmail(signUpDto.email);
      expect(newUser).toBeDefined();

      if (!newUser) {
        throw new Error('Cannot retrieve data for newly created user.');
      }

      validationTokenEvent = await apiEventsService.getLatestEventForTopic({
        topic: newUser.id,
        kind: API_EVENT_KINDS.user__accountActivationTokenGenerated__v1alpha1,
      });

      await request(app.getHttpServer())
        .post(`/auth/validate`)
        .send({
          sub: newUser.id,
          validationToken: validationTokenEvent?.data?.validationToken,
        })
        .expect(HttpStatus.CREATED);
    });

    test('A user account validation token should not be allowed to be spent more than once', async () => {
      if (!newUser) {
        throw new Error('Cannot retrieve data for newly created user.');
      }

      await request(app.getHttpServer())
        .post(`/auth/validate`)
        .send({
          sub: newUser.id,
          validationToken: validationTokenEvent?.data?.validationToken,
        })
        .expect(HttpStatus.NOT_FOUND);
    });

    test('A user should be able to log in once their account has been validated', async () => {
      await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send(loginDto)
        .expect(HttpStatus.CREATED);
    });
  });

  describe('Users - metadata', () => {
    let jwtToken: string;

    beforeAll(async () => {
      jwtToken = await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send(loginDto)
        .expect(HttpStatus.CREATED)
        .then((response) => response.body.accessToken);
    });

    test('A user should be able to read their own metadata', async () => {
      const results = await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.OK);

      expect(results);
    });

    test('A user should be able to update their own metadata', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(E2E_CONFIG.users.updated.bb())
        .expect(HttpStatus.OK);
    });
  });

  describe('Users - password updates which should fail', () => {
    let jwtToken: string;

    beforeAll(async () => {
      jwtToken = await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send(loginDto)
        .expect(HttpStatus.CREATED)
        .then((response) => response.body.accessToken);
    });

    test('A user should not be able to change their password as part of the user update lifecycle', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/users/me/')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          ...E2E_CONFIG.users.updated.bb(),
          password: faker.random.alphaNumeric(),
        })
        .expect(HttpStatus.FORBIDDEN);
    });

    test('A user should not be able to change their password if they provide an incorrect current password', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/users/me/password')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          currentPassword: faker.random.uuid(),
          newPassword: aNewPassword,
        })
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe('Users - password updates which should succeed', () => {
    let jwtToken: string;

    beforeAll(async () => {
      jwtToken = await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send(loginDto)
        .expect(HttpStatus.CREATED)
        .then((response) => response.body.accessToken);
    });

    test('A user should be able to change their password if they provide the correct current password', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/users/me/password')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          currentPassword: loginDto.password,
          newPassword: aNewPassword,
        })
        .expect(HttpStatus.OK);
    });

    test('A user should be able to change their password if they provide the correct current password (take 2, back to initial password)', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/users/me/password')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          currentPassword: aNewPassword,
          newPassword: loginDto.password,
        })
        .expect(HttpStatus.OK);
    });
  });

  describe('Users - account deletion', () => {
    let jwtToken: string;

    beforeAll(async () => {
      jwtToken = await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send(loginDto)
        .expect(HttpStatus.CREATED)
        .then((response) => response.body.accessToken);
    });

    test('A user should be able to delete their own account', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/users/me')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.OK);
    });

    test('Once a user account is marked as deleted, the user should be logged out', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    test('Once a user account is marked as deleted, the user should not be able to log back in', async () => {
      await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send(loginDto)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('Users - Sign up again', () => {
    let newUser: User | undefined;
    let validationTokenEvent: ApiEventByTopicAndKind | undefined;

    test('A user should be able to sign up using the same email address as that of an account that has been deleted', async () => {
      mockAccountActivation();

      await request(app.getHttpServer())
        .post('/auth/sign-up')
        .send(signUpDto)
        .expect(HttpStatus.CREATED);
    });

    test('A user should be able to validate their account (within the validity timeframe of the validationToken)', async () => {
      /**
       * Here we need to dig into the actual database to retrieve both the id
       * assigned to the user when their account is created, and the one-time
       * token that they would normally receive via email as part of the account
       * validation/email confirmation workflow.
       */
      newUser = await usersService.findByEmail(signUpDto.email);
      expect(newUser).toBeDefined();

      if (!newUser) {
        throw new Error('Cannot retrieve data for newly created user.');
      }

      validationTokenEvent = await apiEventsService.getLatestEventForTopic({
        topic: newUser.id,
        kind: API_EVENT_KINDS.user__accountActivationTokenGenerated__v1alpha1,
      });

      await request(app.getHttpServer())
        .post(`/auth/validate`)
        .send({
          sub: newUser.id,
          validationToken: validationTokenEvent?.data?.validationToken,
        })
        .expect(HttpStatus.CREATED);
    });

    test('A user should be able to log in once their account has been validated', async () => {
      await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send(loginDto)
        .expect(HttpStatus.CREATED);
    });
  });

  describe('Users - Platform admins', () => {
    let adminToken: string;
    let adminUserId: string;
    const cleanups: (() => Promise<void>)[] = [];

    beforeAll(async () => {
      adminToken = await GivenUserIsLoggedIn(app, 'dd');
      adminUserId = await GivenUserExists(app, 'dd');
    });

    afterEach(async () => {
      for (const cleanup of cleanups.reverse()) {
        await cleanup();
      }
    });

    test('A platform admin should be able to get the list of admins in the app after seed (just 1)', async () => {
      const WhenGettingAdminListResponse = await request(app.getHttpServer())
        .get('/api/v1/users/admins')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(WhenGettingAdminListResponse.status).toEqual(200);
      expect(WhenGettingAdminListResponse.body).toHaveLength(1);
      expect(WhenGettingAdminListResponse.body[0].userId).toEqual(adminUserId);
    });

    test('A platform admin should be able to add a new admin', async () => {
      const { accessToken: newAdminToken, user } = await GivenUserIsCreated(
        app,
      );

      cleanups.push(async () => {
        await usersRepo.delete({ id: user.id });
        return;
      });

      const WhenAddingNewAdminResponse = await request(app.getHttpServer())
        .post(`/api/v1/users/admins/${user.id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(WhenAddingNewAdminResponse.status).toEqual(201);

      const WhenGettingAdminListByNewUserResponse = await request(
        app.getHttpServer(),
      )
        .get('/api/v1/users/admins')
        .set('Authorization', `Bearer ${newAdminToken}`);
      expect(WhenGettingAdminListByNewUserResponse.status).toEqual(200);

      const resources = WhenGettingAdminListByNewUserResponse.body;
      expect(resources).toHaveLength(2);

      const userIds = [user.id, adminUserId];

      const adminUserIds: string[] = resources.map((s: any) => s.userId);
      expect(adminUserIds.sort()).toEqual(userIds.sort());
    });

    test('A platform admin should be able to remove an existing admin', async () => {
      const { user } = await GivenUserIsCreated(app);

      cleanups.push(async () => {
        await usersRepo.delete({ id: user.id });
        return;
      });

      const WhenAddingNewAdminResponse = await request(app.getHttpServer())
        .post(`/api/v1/users/admins/${user.id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(WhenAddingNewAdminResponse.status).toEqual(201);

      const WhenRemovingExistingAdmin = await request(app.getHttpServer())
        .delete(`/api/v1/users/admins/${user.id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(WhenRemovingExistingAdmin.status).toEqual(200);

      const WhenGettingAdminListResponse = await request(app.getHttpServer())
        .get('/api/v1/users/admins')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(WhenGettingAdminListResponse.status).toEqual(200);
      expect(WhenGettingAdminListResponse.body).toHaveLength(1);
      expect(WhenGettingAdminListResponse.body[0].userId).toEqual(adminUserId);
    });

    test('A platform admin should be able to block existing users', async () => {
      const username = `${v4()}@example.com`;
      const password = v4();
      const { user } = await GivenUserIsCreated(app, username, password);

      cleanups.push(async () => {
        await usersRepo.delete({ id: user.id });
        return;
      });

      const WhenBlockingAUser = await request(app.getHttpServer())
        .patch(`/api/v1/users/admins/block-users`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userIds: [user.id] });
      expect(WhenBlockingAUser.status).toEqual(200);

      const WhenLoginAsBlockedUser = await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({
          username,
          password,
        });
      expect(WhenLoginAsBlockedUser.status).toEqual(401);
    });
  });
});
