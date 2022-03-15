import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';
import { Job } from 'bullmq';

import { JobInput, ProtectedArea } from '@marxan/protected-areas';
import { bootstrapApplication } from '../../../utils';
import { ProtectedAreaProcessor } from '@marxan-geoprocessing/modules/protected-areas/worker/protected-area-processor';
import { shapes } from './shapes';

export const createWorld = async () => {
  const app = await bootstrapApplication().catch((error) => {
    console.log(`error`, error);
    process.stdout.write(`${error}`);
    throw new Error('ETF');
  });
  const repoToken = getRepositoryToken(ProtectedArea);
  const repo: Repository<ProtectedArea> = app.get(repoToken);
  const projectId = v4();
  const scenarioId = v4();

  const sut = app.get(ProtectedAreaProcessor);

  return {
    cleanup: async () => {
      await Promise.all([
        repo.delete({
          projectId,
        }),
      ]);
      await app.close();
    },
    GivenWdpaForProjectAlreadyExists: async (name: string) =>
      repo.save(
        repo.create({
          projectId,
          fullName: name,
        }),
      ),
    WhenNewShapefileIsSubmitted: async (customName?: string) => {
      const validShape = shapes.valid();
      const name = customName ?? validShape.filename;
      const input = {
        data: {
          projectId,
          scenarioId,
          shapefile: {
            ...validShape,
          },
          name,
        },
        id: 'test-job',
      } as unknown as Job<JobInput>;

      await sut.process(input);
      return name;
    },
    projectId,
    ThenProtectedAreaIsAvailable: async (newShapeName: string) =>
      repo
        .find({
          where: {
            fullName: newShapeName,
          },
        })
        // note that the_geom has select: false in entity definition
        .then((results) => results.length > 0),
    ThenProtectedAreaNameIsUpdated: async (newShapeName: string) => {
      const countOfCustomProtectedAreasWithGivenName = await repo.count({
        where: {
          fullName: newShapeName,
        },
      });
      expect(countOfCustomProtectedAreasWithGivenName).toBe(1);
    },
  };
};
