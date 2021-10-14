import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';
import { Job } from 'bullmq';

import { ProtectedArea, JobInput } from '@marxan/protected-areas';

export const createWorld = (
  app: INestApplication,
  shapefile: Express.Multer.File,
) => {
  const repoToken = getRepositoryToken(ProtectedArea);
  const repo: Repository<ProtectedArea> = app.get(repoToken);
  const projectId = v4();
  const scenarioId = v4();

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
          scenarioId,
          shapefile: {
            ...shapefile,
            filename: name,
          },
        },
        id: 'test-job',
      } as unknown) as Job<JobInput>),
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
