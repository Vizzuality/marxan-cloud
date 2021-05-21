import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProtectedArea } from '../../../../src/modules/protected-areas/protected-areas.geo.entity';

export const world = (app: INestApplication, projectId: string) => {
  const repoToken = getRepositoryToken(ProtectedArea);
  const repo: Repository<ProtectedArea> = app.get(repoToken);

  return {
    cleanup: async () =>
      Promise.all([
        repo.delete({
          projectId,
        }),
      ]),
    GivenWdpaExists: async () =>
      repo.save(
        repo.create({
          projectId,
        }),
      ),
  };
};
