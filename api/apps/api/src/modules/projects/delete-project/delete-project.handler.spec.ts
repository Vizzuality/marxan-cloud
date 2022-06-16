import { GeoFeature } from '@marxan-api/modules/geo-features/geo-feature.api.entity';
import { FakeLogger } from '@marxan-api/utils/__mocks__/fake-logger';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Injectable, Logger } from '@nestjs/common';
import { CqrsModule, EventBus, IEvent } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { v4 } from 'uuid';
import { ProjectDeleted } from '../events/project-deleted.event';
import { Project } from '../project.api.entity';
import { DeleteProject } from './delete-project.command';
import { DeleteProjectHandler } from './delete-project.handler';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

it('deletes a project and emits a ProjectDeleted event', async () => {
  const projectId = fixtures.GivenProjectExits();

  await fixtures.WhenAProjectIsDeleted(projectId);
  await fixtures.ThenProjectIsDeletedDeleted(projectId);
  fixtures.ThenAProjectDeletedEventIsEmitted(projectId);
});

it.todo('fails to delete a project ', async () => {});

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
    WhenAProjectIsDeleted: async (projectId: string) => {
      return sut.execute(new DeleteProject(projectId));
    },
    ThenProjectIsDeletedDeleted: async (projectId: string) => {
      const project = await projectsRepo.find({ where: { projectId } });
      expect(project).toBeUndefined();
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
  };
};

@Injectable()
class FakeProjectRepo {
  public projects: { id: string; scenarios: { id: string }[] }[] = [];
  async find(conditions: { where: { projectId: string } }) {
    const res = this.projects.find(
      (project) => project.id === conditions.where.projectId,
    );
    return res ? [res] : undefined;
  }
  async delete(projectId: string) {
    const index = this.projects.findIndex(
      (project) => project.id === projectId,
    );
    this.projects.splice(index, 1);
  }
}
