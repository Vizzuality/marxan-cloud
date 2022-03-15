import { INestApplication } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces/modules/module-metadata.interface';
import { TestClientApi } from './test-client/test-client-api';
import { E2E_CONFIG } from '../e2e.config';

/**
 *
 * @deprecated This will be removed, please use TestClientApi instead
 * **/
export const bootstrapApplication = async (
  imports: ModuleMetadata['imports'] = [],
  providers: ModuleMetadata['providers'] = [],
): Promise<INestApplication> => {
  const api = await TestClientApi.initialize();

  const jwt = await api.utils.createWorkingUser({
    email: E2E_CONFIG.users.basic.aa.username,
    password: E2E_CONFIG.users.basic.aa.password,
  });
  await api.utils.createWorkingUser({
    email: E2E_CONFIG.users.basic.bb.username,
    password: E2E_CONFIG.users.basic.bb.password,
  });
  await api.utils.createWorkingUser({
    email: E2E_CONFIG.users.basic.cc.username,
    password: E2E_CONFIG.users.basic.cc.password,
  });
  await api.utils.createWorkingProjectWithScenario(jwt);

  return api.getNestInstance();
};
