import { GeoFeature } from '@marxan-api/modules/geo-features/geo-feature.api.entity';
import { FakeLogger } from '@marxan-api/utils/__mocks__/fake-logger';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Injectable, Logger } from '@nestjs/common';
import { CqrsModule, EventBus, IEvent } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { isLeft, isRight } from 'fp-ts/lib/Either';
import { v4 } from 'uuid';
import { ProjectDeleted } from '../events/project-deleted.event';
import { Project } from '../project.api.entity';
import {
  DeleteProject,
  deleteProjectFailed,
  DeleteProjectResponse,
} from './delete-project.command';
import { DeleteProjectHandler } from './delete-project.handler';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

it('deletes a project and emits a ProjectDeleted event', async () => {
  const projectId = fixtures.GivenProjectExits();

  const result = await fixtures.WhenAProjectIsDeleted(projectId);

  fixtures.ThenTrueIsReturned(result);
  await fixtures.ThenProjectIsDeleted(projectId);
  fixtures.ThenAProjectDeletedEventIsEmitted(projectId);
});

it('fails to delete a project ', async () => {
  const projectId = fixtures.GivenProjectExits();
  fixtures.GivenDeleteOperationFails();

  const result = await fixtures.WhenAProjectIsDeleted(projectId);

  fixtures.ThenDeleteProjectFailedIsReturned(result);
  await fixtures.ThenProjectIsNotDeleted(projectId);
  fixtures.ThenNoEventIsEmitted(projectId);
});

const getFixtures = async () => {
  const projectCustomFeaturesIds = [v4(), v4(), v4()];
  const sandbox = await Test.createTestingModule({
    imports: [CqrsModule],
    providers: [
      { provide: getRepositoryToken(Project), useClass: FakeProjectRepo },
      {
        provide: getRepositoryToken(GeoFeature),
        useValue: {
          find: async () =>
            projectCustomFeaturesIds.map((featureId) => ({ id: featureId })),
        },
      },
      {
        provide: Logger,
        useClass: FakeLogger,
      },
      DeleteProjectHandler,
    ],
  }).compile();
  await sandbox.init();

  const scenarioIds = [v4(), v4(), v4()];

  const events: IEvent[] = [];

  const sut = sandbox.get(DeleteProjectHandler);
  const projectsRepo: FakeProjectRepo = sandbox.get(
    getRepositoryToken(Project),
  );

  sandbox.get(EventBus).subscribe((event) => {
    events.push(event);
  });

  return {
    GivenProjectExits: () => {
      const projectId = v4();
      projectsRepo.projects.push({
        id: projectId,
        scenarios: scenarioIds.map((scenarioId) => ({
          id: scenarioId,
        })),
      });
      return projectId;
    },
    GivenDeleteOperationFails: () => {
      projectsRepo.failDeleteOperation = true;
    },
    WhenAProjectIsDeleted: async (projectId: string) => {
      return sut.execute(new DeleteProject(projectId));
    },
    ThenTrueIsReturned: (result: DeleteProjectResponse) => {
      if (isLeft(result)) throw new Error('got left expected right');

      expect(result.right).toEqual(true);
    },
    ThenDeleteProjectFailedIsReturned: (result: DeleteProjectResponse) => {
      if (isRight(result)) throw new Error('got right expected left');

      expect(result.left).toEqual(deleteProjectFailed);
    },
    ThenProjectIsDeleted: async (projectId: string) => {
      const project = await projectsRepo.find({ where: { id: projectId } });
      expect(project).toBeUndefined();
    },
    ThenProjectIsNotDeleted: async (projectId: string) => {
      const projects = await projectsRepo.find({ where: { id: projectId } });
      if (!projects) throw new Error('got undefined, expected project');

      expect(projects).toHaveLength(1);
      const project = projects[0];
      expect(project).toEqual({
        id: projectId,
        scenarios: scenarioIds.map((scenarioId) => ({
          id: scenarioId,
        })),
      });
    },
    ThenAProjectDeletedEventIsEmitted: (projectId: string) => {
      const projectDeletedEvent = events[0];

      expect(projectDeletedEvent).toMatchObject({
        projectId,
        scenarioIds,
        projectCustomFeaturesIds,
      });
      expect(projectDeletedEvent).toBeInstanceOf(ProjectDeleted);
    },
    ThenNoEventIsEmitted: (projectId: string) => {
      expect(events).toHaveLength(0);
    },
  };
};

@Injectable()
class FakeProjectRepo {
  public projects: { id: string; scenarios: { id: string }[] }[] = [];
  public failDeleteOperation = false;
  async find(conditions: { where: { id: string } }) {
    const res = this.projects.find(
      (project) => project.id === conditions.where.id,
    );
    return res ? [res] : undefined;
  }
  async delete(projectId: string) {
    if (this.failDeleteOperation) throw new Error('delete operation failed');
    const index = this.projects.findIndex(
      (project) => project.id === projectId,
    );
    this.projects.splice(index, 1);
  }
}
