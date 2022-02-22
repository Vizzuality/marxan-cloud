import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export const GivenUserIsDeleted = async (
  app: INestApplication,
  accessToken: string,
): Promise<void> => {
  await request(app.getHttpServer())
    .delete('/api/v1/users/me')
    .set('Authorization', `Bearer ${accessToken}`);
};
