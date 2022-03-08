import { Server } from 'http';
import { E2E_CONFIG } from '../e2e.config';
import * as request from 'supertest';

export class ScenarioRequests {
  constructor(private readonly app: Server) {}

  public createScenario(
    jwt: string,
    data = E2E_CONFIG.scenarios.valid.minimal(),
  ) {
    return request(this.app)
      .post('/api/v1/scenarios')
      .auth(jwt, { type: 'bearer' })
      .send(data);
  }
}
