import { HttpStatus, INestApplication } from '@nestjs/common';
import * as faker from 'faker';
import * as request from 'supertest';
import { E2E_CONFIG } from './e2e.config';
import { v4 } from 'uuid';
import { SignUpDto } from '@marxan-api/modules/authentication/dto/sign-up.dto';
import { ApiEventsService } from '@marxan-api/modules/api-events/api-events.service';
import { UsersService } from '@marxan-api/modules/users/users.service';
import { LoginDto } from '@marxan-api/modules/authentication/dto/login.dto';
import { API_EVENT_KINDS } from '@marxan/api-events';
import * as nock from 'nock';
import { CreateTransmission, Recipient } from 'sparkpost';
import { AppConfig } from '@marxan-api/utils/config.utils';
import { bootstrapApplication } from './utils/api-application';
import { GivenUserIsLoggedIn } from './steps/given-user-is-logged-in';
import { GivenUserExists } from './steps/given-user-exists';
import { GivenUserIsCreated } from './steps/given-user-is-created';

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

describe('UsersModule (e2e)', () => {
  let app: INestApplication;
  let apiEventsService: ApiEventsService;
  let usersService: UsersService;

  const aNewPassword = faker.random.uuid();

  let signUpDto: SignUpDto;
  let loginDto: LoginDto;

  const registerAndValidateUser = async (signUpDto: SignUpDto) => {
    await request(app.getHttpServer())
      .post('/auth/sign-up')
      .send(signUpDto)
      .expect(HttpStatus.CREATED);
    const user = await usersService.findByEmail(signUpDto.email);
    expect(user).toBeDefined();

    if (!user) {
      throw new Error('Cannot retrieve data for newly created user.');
    }

    const validationTokenEvent = await apiEventsService.getLatestEventForTopic({
      topic: user.id,
      kind: API_EVENT_KINDS.user__accountActivationTokenGenerated__v1alpha1,
    });

    await request(app.getHttpServer())
      .post(`/auth/validate`)
      .send({
        sub: user.id,
        validationToken: validationTokenEvent?.data?.validationToken,
      })
      .expect(HttpStatus.CREATED);

    return await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send(loginDto)
      .expect(HttpStatus.CREATED)
      .then((response) => response.body.accessToken);
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

  beforeEach(async () => {
    app = await bootstrapApplication();

    apiEventsService = app.get<ApiEventsService>(ApiEventsService);
    usersService = app.get<UsersService>(UsersService);

    signUpDto = {
      email: `${v4()}@example.com`,
      password: v4(),
      displayName: `${faker.name.firstName()} ${faker.name.lastName()}`,
    };
    loginDto = {
      username: signUpDto.email,
      password: signUpDto.password,
    };
  });

  describe('Users - sign up and validation', () => {
    test('A user should be able to create an account using an email address not currently in use', async () => {
      mockAccountActivation();

      await request(app.getHttpServer())
        .post('/auth/sign-up')
        .send(signUpDto)
        .expect(HttpStatus.CREATED);
    });

    test('A user should not be able to create an account using a weak password', async () => {
      // TODO: The signUp dto has no validation for password strength, this is validated by the entropyCheck thing.
      //       we should make the threshold value configurable and set different values for tests, or set a default threshold that allows
      //       "precondition users" to be created
      await request(app.getHttpServer())
        .post('/auth/sign-up')
        .send({
          ...signUpDto,
          password: 'a',
        })
        .expect(HttpStatus.FORBIDDEN);
    });

    test('A user should not be able to create an account using an email address already in use', async () => {
      await request(app.getHttpServer())
        .post('/auth/sign-up')
        .send(signUpDto)
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .post('/auth/sign-up')
        .send(signUpDto)
        .expect(HttpStatus.CONFLICT);
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
      await request(app.getHttpServer())
        .post('/auth/sign-up')
        .send(signUpDto)
        .expect(HttpStatus.CREATED);

      const user = await usersService.findByEmail(signUpDto.email);
      expect(user).toBeDefined();

      if (!user) {
        throw new Error('Cannot retrieve data for newly created user.');
      }

      const validationTokenEvent =
        await apiEventsService.getLatestEventForTopic({
          topic: user.id,
          kind: API_EVENT_KINDS.user__accountActivationTokenGenerated__v1alpha1,
        });

      await request(app.getHttpServer())
        .post(`/auth/validate`)
        .send({
          sub: user.id,
          validationToken: validationTokenEvent?.data?.validationToken,
        })
        .expect(HttpStatus.CREATED);
    });

    test('A user account validation token should not be allowed to be spent more than once', async () => {
      await request(app.getHttpServer())
        .post('/auth/sign-up')
        .send(signUpDto)
        .expect(HttpStatus.CREATED);
      const user = await usersService.findByEmail(signUpDto.email);
      expect(user).toBeDefined();

      if (!user) {
        throw new Error('Cannot retrieve data for newly created user.');
      }

      const validationTokenEvent =
        await apiEventsService.getLatestEventForTopic({
          topic: user.id,
          kind: API_EVENT_KINDS.user__accountActivationTokenGenerated__v1alpha1,
        });

      await request(app.getHttpServer())
        .post(`/auth/validate`)
        .send({
          sub: user.id,
          validationToken: validationTokenEvent?.data?.validationToken,
        })
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .post(`/auth/validate`)
        .send({
          sub: user.id,
          validationToken: validationTokenEvent?.data?.validationToken,
        })
        .expect(HttpStatus.NOT_FOUND);
    });

    test('A user should be able to log in once their account has been validated', async () => {
      await request(app.getHttpServer())
        .post('/auth/sign-up')
        .send(signUpDto)
        .expect(HttpStatus.CREATED);
      const user = await usersService.findByEmail(signUpDto.email);
      expect(user).toBeDefined();

      if (!user) {
        throw new Error('Cannot retrieve data for newly created user.');
      }

      const validationTokenEvent =
        await apiEventsService.getLatestEventForTopic({
          topic: user.id,
          kind: API_EVENT_KINDS.user__accountActivationTokenGenerated__v1alpha1,
        });

      await request(app.getHttpServer())
        .post(`/auth/validate`)
        .send({
          sub: user.id,
          validationToken: validationTokenEvent?.data?.validationToken,
        })
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send(loginDto)
        .expect(HttpStatus.CREATED);
    });
  });

  describe('Users - metadata', () => {
    let jwtToken: string;

    beforeEach(async () => {
      jwtToken = await registerAndValidateUser(signUpDto);
    });

    test('A user should be able to read their own metadata', async () => {
      const results = await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.OK);

      expect(results.body.data).toEqual({
        type: 'users',
        id: expect.any(String),
        attributes: {
          fname: null,
          lname: null,
          email: expect.any(String),
          displayName: expect.any(String),
          avatarDataUrl: null,
          isActive: true,
          isAdmin: false,
          isBlocked: false,
          isDeleted: false,
          metadata: null,
        },
      });
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

    beforeEach(async () => {
      jwtToken = await registerAndValidateUser(signUpDto);
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

    beforeEach(async () => {
      jwtToken = await registerAndValidateUser(signUpDto);
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
          currentPassword: loginDto.password,
          newPassword: aNewPassword,
        })
        .expect(HttpStatus.OK);
    });
  });

  describe('Users - account deletion', () => {
    let jwtToken: string;

    beforeEach(async () => {
      jwtToken = await registerAndValidateUser(signUpDto);
    });

    test('A user should be able to delete their own account', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/users/me')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.OK);
    });

    test('Once a user account is marked as deleted, the user should be logged out', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/users/me')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.OK);

      await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    test('Once a user account is marked as deleted, the user should not be able to log back in', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/users/me')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.OK);

      await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send(loginDto)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    test('A user should be able to sign up using the same email address as that of an account that has been deleted', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/users/me')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.OK);

      await request(app.getHttpServer())
        .post('/auth/sign-up')
        .send(signUpDto)
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
    let nonAdminToken: string;

    beforeEach(async () => {
      // TODO: Can we remove this? Admin users are being created in the seed, this is redundant
      adminToken = await GivenUserIsLoggedIn(app, 'dd');
      adminUserId = await GivenUserExists(app, 'dd');
      nonAdminToken = await GivenUserIsLoggedIn(app, 'aa');
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
      const { accessToken: newAdminToken, user } =
        await GivenUserIsCreated(app);

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

    test('A platform admin should be able to identify itself as admin on /me endpoint', async () => {
      const WhenGettingOwnInfo = await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(WhenGettingOwnInfo.body.data.attributes.isAdmin).toBe(true);
    });

    test('A non platform admin should be not able to identify itself as admin on /me endpoint', async () => {
      const WhenGettingOwnInfo = await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${nonAdminToken}`);

      expect(WhenGettingOwnInfo.body.data.attributes.isAdmin).toBe(false);
    });

    test('A platform admin should be able to remove an existing admin', async () => {
      const { user } = await GivenUserIsCreated(app);

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

    test('A platform admin should not be able to remove oneself', async () => {
      const WhenRemovingOneself = await request(app.getHttpServer())
        .delete(`/api/v1/users/admins/${adminUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(WhenRemovingOneself.status).toEqual(400);
    });

    test('A platform admin should be able to block existing users by batch', async () => {
      const firstUsername = `${v4()}@example.com`;
      const firstPassword = v4();
      const secondUsername = `${v4()}@example.com`;
      const secondPassword = v4();
      const { user: firstUser } = await GivenUserIsCreated(
        app,
        firstUsername,
        firstPassword,
      );
      const { user: secondUser } = await GivenUserIsCreated(
        app,
        secondUsername,
        secondPassword,
      );

      const WhenBlockingUsersInBatch = await request(app.getHttpServer())
        .patch(`/api/v1/users/admins/block-users`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userIds: [firstUser.id, secondUser.id] });
      expect(WhenBlockingUsersInBatch.status).toEqual(200);

      const WhenLoginAsFirstBlockedUser = await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({
          firstUsername,
          firstPassword,
        });
      expect(WhenLoginAsFirstBlockedUser.status).toEqual(401);
      const WhenLoginAsSecondBlockedUser = await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({
          secondUsername,
          secondPassword,
        });
      expect(WhenLoginAsSecondBlockedUser.status).toEqual(401);
    });

    test('A platform admin should be able to block a single user by id', async () => {
      const username = `${v4()}@example.com`;
      const password = v4();
      const { user } = await GivenUserIsCreated(app, username, password);

      const WhenBlockingAUser = await request(app.getHttpServer())
        .post(`/api/v1/users/block/${user.id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(WhenBlockingAUser.status).toEqual(201);

      const WhenLoginAsBlockedUser = await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({
          username,
          password,
        });
      expect(WhenLoginAsBlockedUser.status).toEqual(401);
    });

    test('A platform admin should be able to unblock a single user by id', async () => {
      const username = `${v4()}@example.com`;
      const password = v4();
      const { user } = await GivenUserIsCreated(app, username, password);
      const WhenBlockingAUser = await request(app.getHttpServer())
        .post(`/api/v1/users/block/${user.id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(WhenBlockingAUser.status).toEqual(201);

      const WhenLoginAsBlockedUser = await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({
          username,
          password,
        });
      expect(WhenLoginAsBlockedUser.status).toEqual(401);

      const WhenUnblockingAUser = await request(app.getHttpServer())
        .delete(`/api/v1/users/block/${user.id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(WhenUnblockingAUser.status).toEqual(200);

      const WhenLoginAsUnBlockedUser = await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({
          username,
          password,
        });
      expect(WhenLoginAsUnBlockedUser.status).toEqual(201);
    });

    test('A platform admin should not be able to block oneself', async () => {
      const WhenBlockingOneself = await request(app.getHttpServer())
        .patch(`/api/v1/users/admins/block-users`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userIds: [adminUserId] });
      expect(WhenBlockingOneself.status).toEqual(400);
    });

    test('A platform admin should be able to download csv data from users', async () => {
      const WhenDownloadingCsvData = await request(app.getHttpServer())
        .get(`/api/v1/users/csv`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(WhenDownloadingCsvData.status).toEqual(200);
      expect(WhenDownloadingCsvData.headers['content-type']).toBe(
        'text/csv; charset=utf-8',
      );
    });

    test('A non admin user should not be able to download csv data from users', async () => {
      const WhenDownloadingCsvData = await request(app.getHttpServer())
        .get(`/api/v1/users/csv`)
        .set('Authorization', `Bearer ${nonAdminToken}`);
      expect(WhenDownloadingCsvData.status).toEqual(403);
      expect(WhenDownloadingCsvData.headers['content-type']).toBe(
        'application/json; charset=utf-8',
      );
    });
  });

  describe('', () => {
    test('The API should show a 429: Too many request error if multiple attempts at login are done in a short space of time', async () => {
      // TODO: this should be either done by creating a user in arrangement, or reusing the precondition user (need to retrieve the user object
      //        and that one is deep in the rabbit hole
      await registerAndValidateUser(signUpDto);

      // TODO: The Throttle value is set to 25,60 for this controller, and I've seen nothing in dev brach overriding / mocking this somehow
      //       I don't understand how this was passing in dev given there were 5 simultaneous requests previously
      const requestsArray = await Promise.all([
        ...Array.from({ length: 26 }).map(() =>
          request(app.getHttpServer())
            .post('/auth/sign-in')
            .send({ username: signUpDto.email, password: signUpDto.password }),
        ),
      ]);
      const tooManyRequest = requestsArray.find(
        (r) => r.status === HttpStatus.TOO_MANY_REQUESTS,
      );
      expect(tooManyRequest).toBeDefined();
    });
  });

  describe('Users - Find by email', () => {
    let adminToken: string;

    beforeEach(async () => {
      adminToken = await GivenUserIsLoggedIn(app, 'dd');
    });

    test('A user can be found by full email', async () => {
      const userId = await GivenUserExists(app, 'aa');
      const WhenSearchingUserByFullMail = await request(app.getHttpServer())
        .get('/api/v1/users/by-email/aa@example.com')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(WhenSearchingUserByFullMail.status).toEqual(200);
      expect(WhenSearchingUserByFullMail.body.data).toBeDefined();
      expect(WhenSearchingUserByFullMail.body.data.id).toEqual(userId);
      expect(
        WhenSearchingUserByFullMail.body.data.attributes.displayName,
      ).toEqual('User A A');
    });

    test('Partial email searches return bad request because of validation', async () => {
      const WhenSearchingUserByFullMail = await request(app.getHttpServer())
        .get('/api/v1/users/by-email/aa@example')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(WhenSearchingUserByFullMail.status).toEqual(400);
    });
  });
});
