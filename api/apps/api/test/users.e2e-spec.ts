import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as faker from 'faker';
import * as request from 'supertest';
import { AppModule } from '@marxan-api/app.module';
import { E2E_CONFIG } from './e2e.config';
import { v4 } from 'uuid';
import { SignUpDto } from '@marxan-api/modules/authentication/dto/sign-up.dto';
import { TypeOrmModule } from '@nestjs/typeorm';
import { apiConnections } from '@marxan-api/ormconfig';
import { ApiEvent } from '@marxan-api/modules/api-events/api-event.api.entity';
import { ApiEventsModule } from '@marxan-api/modules/api-events/api-events.module';
import { UsersModule } from '@marxan-api/modules/users/users.module';
import { LoginDto } from '@marxan-api/modules/authentication/dto/login.dto';
import { tearDown } from './utils/tear-down';
import * as nock from 'nock';

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

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await Promise.all([app.close()]);
  });

  describe('Users - sign up and validation', () => {
    let validationToken: string;

    test('A user should be able to create an account using an email address not currently in use', async () => {
      nock('https://api.eu.sparkpost.com')
        .post(`/api/v1/transmissions`)
        .reply(200);

      const res = await request(app.getHttpServer())
        .post('/auth/sign-up')
        .send(signUpDto)
        .expect(HttpStatus.CREATED);

      validationToken = res.body.validationToken;
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
      await request(app.getHttpServer())
        .post(`/auth/validate`)
        .send({ validationToken })
        .expect(HttpStatus.CREATED);
    });

    test('A user account validation token should not be allowed to be spent more than once', async () => {
      await request(app.getHttpServer())
        .post(`/auth/validate`)
        .send({ validationToken })
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
    let validationToken: string;

    test('A user should be able to sign up using the same email address as that of an account that has been deleted', async () => {
      nock('https://api.eu.sparkpost.com')
        .post(`/api/v1/transmissions`)
        .reply(200);

      const res = await request(app.getHttpServer())
        .post('/auth/sign-up')
        .send(signUpDto)
        .expect(HttpStatus.CREATED);

      validationToken = res.body.validationToken;
    });

    test('A user should be able to validate their account (within the validity timeframe of the validationToken)', async () => {
      await request(app.getHttpServer())
        .post(`/auth/validate`)
        .send({ validationToken })
        .expect(HttpStatus.CREATED);
    });

    test('A user should be able to log in once their account has been validated', async () => {
      await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send(loginDto)
        .expect(HttpStatus.CREATED);
    });
  });
});
