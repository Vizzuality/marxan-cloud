import { Server } from 'http';
import * as request from 'supertest';

export class UserRequests {
  constructor(private readonly app: Server) {}

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
}
