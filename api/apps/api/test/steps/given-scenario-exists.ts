import { INestApplication } from '@nestjs/common';
import { CreateScenarioDTO } from '@marxan-api/modules/scenarios/dto/create.scenario.dto';
import { E2E_CONFIG } from '../e2e.config';
import { ScenariosTestUtils } from '../utils/scenarios.test.utils';

export const GivenScenarioExists = async (
  app: INestApplication,
  projectId: string,
  jwtToken: string,
  options?: Partial<CreateScenarioDTO>,
) => {
  const createScenarioDTO: Partial<CreateScenarioDTO> = {
    ...E2E_CONFIG.scenarios.valid.minimal(),
    ...options,
    projectId,
  };
  return (
    await ScenariosTestUtils.createScenario(app, jwtToken, createScenarioDTO)
  ).data.attributes;
};
