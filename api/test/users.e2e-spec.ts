import { Test, TestingModule } from '@nestjs/testing';
import {
  HttpStatus,
  INestApplication,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import * as faker from 'faker';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { E2E_CONFIG } from './e2e.config';
import { v4 } from 'uuid';
import { SignUpDto } from 'modules/authentication/dto/sign-up.dto';
import { User } from 'modules/users/user.api.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { apiConnections } from 'ormconfig';
import {
  ApiEvent,
  API_EVENT_KINDS,
} from 'modules/api-events/api-event.api.entity';
import { ApiEventsModule } from 'modules/api-events/api-events.module';
import { ApiEventsService } from 'modules/api-events/api-events.service';
import { UsersModule } from 'modules/users/users.module';
import { UsersService } from 'modules/users/users.service';

describe('UsersModule (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let apiEventsService: ApiEventsService;
  let usersService: UsersService;

  const aNewPassword = faker.random.uuid();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        ApiEventsModule,
        TypeOrmModule.forRoot({
          ...apiConnections.default,
          keepConnectionAlive: true,
        }),
        TypeOrmModule.forFeature([ApiEvent]),
        UsersModule,
      ],
    }).compile();

    apiEventsService = moduleFixture.get<ApiEventsService>(ApiEventsService);
    usersService = moduleFixture.get<UsersService>(UsersService);

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    const response = await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({
        // In most tests we use seed user `aa@example.com` but here we use
        // bb@example.com to avoid messing with the main user we use in e2e
        // tests.
        username: E2E_CONFIG.users.basic.bb.username,
        password: E2E_CONFIG.users.basic.bb.password,
      })
      .expect(HttpStatus.CREATED);

    jwtToken = response.body.accessToken;
  });

  afterAll(async () => {
    await Promise.all([app.close()]);
  });

  describe('Users - sign up and validation', () => {
    const signUpDto: SignUpDto = {
      email: `${v4()}@example.com`,
      password: v4(),
      displayName: `${faker.name.firstName()} ${faker.name.lastName()}`,
    };

    let newUser: User | undefined;
    let validationTokenEvent: Omit<ApiEvent, 'id'> | undefined;

    test('A user should be able to create an account using an email address not currently in use', async () => {
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

    /**
     * @todo Enable this test once we drop the temporary automatic whitelisting
     * of new accounts in development environments.
     */
    test.skip('A user should not be able to log in until their account has been validated', async () => {
      await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({
          username: signUpDto.email,
          password: signUpDto.password,
        })
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
        throw new Error('Cannot retrieve data for newly created user.')
      };

      validationTokenEvent = await apiEventsService.getLatestEventForTopic({
        topic: newUser.id,
        kind: API_EVENT_KINDS.user__accountActivationTokenGenerated__v1alpha1,
      });

      await request(app.getHttpServer())
        .get(
          `/auth/validate-account/${newUser.id}/${validationTokenEvent?.data?.validationToken}`,
        )
        .expect(HttpStatus.OK);
    });

    test('A user account validation token should not be allowed to be spent more than once', async () => {
      if (!newUser) {
        throw new Error('Cannot retrieve data for newly created user.')
      };

      const response = await request(app.getHttpServer())
        .get(
          `/auth/validate-account/${newUser.id}/${validationTokenEvent?.data?.validationToken}`,
        )
        .expect(HttpStatus.NOT_FOUND);
    });

    test('A user should be able to log in once their account has been validated', async () => {
      await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({
          username: signUpDto.email,
          password: signUpDto.password,
        })
        .expect(HttpStatus.CREATED);
    });
  });

  describe('Users - metadata', () => {
    it('A user should be able to read their own metadata', async () => {
      const results = await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.OK);

      expect(results);
    });

    it('A user should be able to update their own metadata', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(E2E_CONFIG.users.updated.bb())
        .expect(HttpStatus.OK);
    });
  });

  describe('Users - password updates which should fail', () => {
    it('A user should not be able to change their password as part of the user update lifecycle', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/users/me/')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          ...E2E_CONFIG.users.updated.bb(),
          password: faker.random.alphaNumeric(),
        })
        .expect(HttpStatus.FORBIDDEN);
    });

    it('A user should not be able to change their password if they provide an incorrect current password', async () => {
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

  describe('Users - password updates which should succeed (1/2)', () => {
    it('A user should be able to change their password if they provide the correct current password', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/users/me/password')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          currentPassword: E2E_CONFIG.users.basic.bb.password,
          newPassword: aNewPassword,
        })
        .expect(HttpStatus.OK);
    });
  });

  describe('Users - password updates which should succeed (2/2)', () => {
    it('A user should be able to change their password if they provide the correct current password (take 2, back to initial password)', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/users/me/password')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          currentPassword: aNewPassword,
          newPassword: E2E_CONFIG.users.basic.bb.password,
        })
        .expect(HttpStatus.OK);
    });
  });

  describe('Users - account deletion', () => {
    it('A user should be able to delete their own account', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/users/me')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.OK);
    });
  });

  describe('Users - locked out after account deletion', () => {
    it('Once a user account is marked as deleted, the user should be logged out', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('Once a user account is marked as deleted, the user should not be able to log back in', async () => {
      await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({
          username: E2E_CONFIG.users.basic.bb.username,
          password: E2E_CONFIG.users.basic.bb.password,
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
