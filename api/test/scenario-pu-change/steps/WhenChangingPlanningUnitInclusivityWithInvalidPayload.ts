import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { v4 } from 'uuid';
import { sampleMultiPolygonJson } from '../../../src/modules/scenarios/dto/__mocks__/geometry';
import { PlanningUnitsUpdateDto } from '../../../src/modules/scenarios/dto/planning-units-update.dto';

export const WhenChangingInclusivityWithInvalidCombination = async (
  app: INestApplication,
  scenarioId: string,
  jwtToken: string,
) => {
  const dto: PlanningUnitsUpdateDto = Object.assign(
    new PlanningUnitsUpdateDto(),
    {
      byId: {
        include: [v4()],
      },
      byGeoJson: {
        exclude: sampleMultiPolygonJson(),
      },
    },
  );

  return request(app.getHttpServer())
    .patch(`/api/v1/scenarios/${scenarioId}/planning-units`)
    .set('Authorization', `Bearer ${jwtToken}`)
    .send(dto);
};
