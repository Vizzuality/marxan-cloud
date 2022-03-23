import { INestApplication } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces/modules/module-metadata.interface';
import { TestClientApi } from './test-client/test-client-api';
import { E2E_CONFIG } from '../e2e.config';
import { PlatformAdminEntity } from '@marxan-api/modules/users/platform-admin/admin.api.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getConnection, Repository } from 'typeorm';
import { User } from '@marxan-api/modules/users/user.api.entity';
import { DbConnections } from '@marxan-api/ormconfig.connections';

async function seedUsers(api: TestClientApi) {
  const jwt = await api.utils.createWorkingUser({
    email: E2E_CONFIG.users.basic.aa.username,
    password: E2E_CONFIG.users.basic.aa.password,
    displayName: 'User A A',
  });
  await api.utils.createWorkingUser({
    email: E2E_CONFIG.users.basic.bb.username,
    password: E2E_CONFIG.users.basic.bb.password,
    displayName: 'User B B',
  });
  await api.utils.createWorkingUser({
    email: E2E_CONFIG.users.basic.cc.username,
    password: E2E_CONFIG.users.basic.cc.password,
    displayName: 'User C C',
  });
  await api.utils.createWorkingUser({
    email: E2E_CONFIG.users.basic.dd.username,
    password: E2E_CONFIG.users.basic.dd.password,
    displayName: 'User D D',
  });

  return jwt;
}

async function granAdminPrivilegesToUser(
  api: TestClientApi,
  user: 'aa' | 'bb' | 'cc' | 'dd',
) {
  const adminRepository = await api
    .getNestInstance()
    .get<Repository<PlatformAdminEntity>>(
      getRepositoryToken(PlatformAdminEntity),
    );

  const userRepository = await api
    .getNestInstance()
    .get<Repository<User>>(getRepositoryToken(User));

  const admin = await userRepository.findOneOrFail({
    email: E2E_CONFIG.users.basic[user].username,
  });
  await adminRepository.save({ userId: admin.id });
}

async function assignAdminRegionsToUser(
  api: TestClientApi,
  user: 'aa' | 'bb' | 'cc' | 'dd',
) {
  const userRepository = await api
    .getNestInstance()
    .get<Repository<User>>(getRepositoryToken(User));

  const admin = await userRepository.findOneOrFail({
    email: E2E_CONFIG.users.basic[user].username,
  });

  const geoConnection = await getConnection(DbConnections.geoprocessingDB);
  await geoConnection.query(
    `UPDATE admin_regions SET created_by = '${admin.id}';`,
  );
}

/**
 *
 * @deprecated This will be removed, please use TestClientApi instead
 * **/
export const bootstrapApplication = async (
  imports: ModuleMetadata['imports'] = [],
  providers: ModuleMetadata['providers'] = [],
): Promise<INestApplication> => {
  const api = await TestClientApi.initialize(
    TestClientApi.emptyOverrides,
    imports,
  );

  const aaUserJwt = await seedUsers(api);

  await granAdminPrivilegesToUser(api, 'dd');
  await assignAdminRegionsToUser(api, 'dd');

  await api.utils.createWorkingProjectWithScenario(aaUserJwt);

  return api.getNestInstance();
};
