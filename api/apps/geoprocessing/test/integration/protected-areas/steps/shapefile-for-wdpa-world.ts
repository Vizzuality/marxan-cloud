import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';
import { Job } from 'bullmq';

import { ProtectedAreasJobInput } from '@marxan-geoprocessing/modules/protected-areas/worker/worker-input';
import { ProtectedArea } from '@marxan/protected-areas';

export const createWorld = (
  app: INestApplication,
  file: Express.Multer.File,
) => {
  const repoToken = getRepositoryToken(ProtectedArea);
  const repo: Repository<ProtectedArea> = app.get(repoToken);
  const projectId = v4();

  return {
    cleanup: async () =>
      Promise.all([
        repo.delete({
          projectId,
        }),
      ]),
    GivenWdpaForProjectAlreadyExists: async (name: string) =>
      repo.save(
        repo.create({
          projectId,
          fullName: name,
        }),
      ),
    WhenNewShapefileIsSubmitted: (name: string) =>
      (({
        data: {
          projectId,
          file: {
            ...file,
            filename: name,
          },
        },
        id: 'test-job',
      } as unknown) as Job<ProtectedAreasJobInput>),
    projectId,
    ThenOldEntriesAreRemoved: async (oldShapeName: string) =>
      repo
        .find({
          where: {
            fullName: oldShapeName,
          },
        })
        .then((results) => results.length === 0),
    ThenOldEntriesAreNotRemoved: async (oldShapeName: string) =>
      repo
        .find({
          where: {
            fullName: oldShapeName,
          },
        })
        .then((results) => results.length > 0),
    ThenNewEntriesArePublished: async (newShapeName: string) =>
      repo
        .find({
          where: {
            fullName: newShapeName,
          },
        })
        // note that the_geom has select: false in entity definition
        .then((results) => results.length > 0),
    ThenNewEntriesAreNotPublished: async (newShapeName: string) =>
      repo
        .find({
          where: {
            fullName: newShapeName,
          },
        })
        .then((results) => results.length === 0),
  };
};
