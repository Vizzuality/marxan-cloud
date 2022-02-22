import { AccessToken } from '@marxan-api/modules/authentication/authentication.service';
import { User } from '@marxan-api/modules/users/user.api.entity';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { hash } from 'bcrypt';
import * as faker from 'faker';
import * as request from 'supertest';
import { Repository } from 'typeorm';

export const GivenUserIsCreated = async (
  app: INestApplication,
): Promise<AccessToken> => {
  const email = faker.internet.email();
  const password = faker.internet.password();
  const displayName = faker.name.firstName();

  const user = new User();
  user.displayName = displayName;
  user.passwordHash = await hash(password, 10);
  user.email = email;
  user.isActive = true;

  const usersRepo: Repository<User> = app.get(getRepositoryToken(User));

  await usersRepo.save(user);

  const { body } = await request(app.getHttpServer())
    .post('/auth/sign-in')
    .send({
      username: email,
      password,
    });

  return body;
};
