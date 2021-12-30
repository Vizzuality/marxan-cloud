import * as request from 'supertest';
import { HttpStatus, INestApplication, Logger } from '@nestjs/common';
import { CreateScenarioDTO } from '@marxan-api/modules/scenarios/dto/create.scenario.dto';
import { ScenarioResult } from '@marxan-api/modules/scenarios/scenario.api.entity';

/**
 * Utility functions for tests related to Scenarios.
 *
 * Hopefully helping to reduce some boilerplate in operations that need to be
 * carried out throughout tests.
 *
 * Create functions return the raw response body - no need to assert anything
 * here as these utility functions mainly do some work at the edge of what is
 * actually being tested.
 */
export class ScenariosTestUtils {
  static async createScenario(
    app: INestApplication,
    jwtToken: string,
    scenarioDTO: Partial<CreateScenarioDTO>,
  ): Promise<ScenarioResult> {
    return await request(app.getHttpServer())
      .post('/api/v1/scenarios')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(scenarioDTO)
      .expect(HttpStatus.CREATED)
      .then((response) => response.body)
      .catch((error) => {
        Logger.error(error);
      });
  }

  static async deleteScenario(
    app: INestApplication,
    jwtToken: string,
    id: string,
  ): Promise<void> {
    await request(app.getHttpServer())
      .delete(`/api/v1/scenarios/${id}`)
      .expect(HttpStatus.OK)
      .set('Authorization', `Bearer ${jwtToken}`);
  }
}
