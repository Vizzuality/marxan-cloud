import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { E2E_CONFIG } from '../e2e.config';

export const GivenUserExists = async (
  app: INestApplication,
  type: `aa` | `bb` | `cc` | `dd` = `aa`,
): Promise<string> => {
  const response = await request(app.getHttpServer())
    .post('/auth/sign-in')
    .send({
      username: E2E_CONFIG.users.basic[type].username,
      password: E2E_CONFIG.users.basic[type].password,
    });

  return response.body.user.id;
};
