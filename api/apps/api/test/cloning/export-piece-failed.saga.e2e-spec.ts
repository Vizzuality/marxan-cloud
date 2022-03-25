import { ApiEventsService } from '@marxan-api/modules/api-events';
import { ExportEntity } from '@marxan-api/modules/clone/export/adapters/entities/exports.api.entity';
import { ExportPieceFailed } from '@marxan-api/modules/clone/export/application/export-piece-failed.event';
import { ExportRepository } from '@marxan-api/modules/clone/export/application/export-repository.port';
import { ExportId } from '@marxan-api/modules/clone/export/domain';
import { exportPieceQueueToken } from '@marxan-api/modules/clone/infra/export/export-queue.provider';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ComponentId, ResourceId } from '@marxan/cloning/domain';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { EventBus } from '@nestjs/cqrs';
import * as request from 'supertest';
import { Connection } from 'typeorm';
import { validate, version } from 'uuid';
import { GivenProjectExists } from '../steps/given-project';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { bootstrapApplication } from '../utils/api-application';
import { OrganizationsTestUtils } from '../utils/organizations.test.utils';
import { ProjectsTestUtils } from '../utils/projects.test.utils';
import { FakeQueue } from '../utils/queues';

interface FakePendingJob {
  id: string;
  data: {
    exportId: string;
    componentId: string;
  };
}

export const delay = (ms = 1000) =>
  new Promise((resolve) => setTimeout(resolve, ms));

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
}, 20000);

afterEach(async () => {
  await fixtures?.cleanup();
});

it('should mark export as failed', async () => {
  await fixtures.GivenExportWasRequested();

  await fixtures.WhenAnExportPieceJobFails({ withPendingJobs: false });

  await fixtures.ThenExportIsMarkedAsFailed();
}, 10000);

it('should remove pending export-piece jobs and mark expor pieces as failed', async () => {
  await fixtures.GivenExportWasRequested();

  await fixtures.WhenAnExportPieceJobFails({ withPendingJobs: true });

  await fixtures.ThenPendingExportPieceJobsAreCancelled();
  await fixtures.ThenCancelledExportPiecesAreMarkedAsFailed();
}, 10000);

const getFixtures = async () => {
  const app = await bootstrapApplication();
  const token = await GivenUserIsLoggedIn(app);
  const { projectId, organizationId } = await GivenProjectExists(app, token);

  const repo = app.get(ExportRepository);
  const eventBus = app.get(EventBus);
  const apiEventsService = app.get(ApiEventsService);
  const exportPieceQueue = app.get<FakeQueue>(exportPieceQueueToken);

  let exportId: ExportId;
  const resourceId = new ResourceId(projectId);
  let fakePendingJobs: FakePendingJob[] = [];

  return {
    cleanup: async () => {
      const connection = app.get<Connection>(Connection);
      const exportRepo = connection.getRepository(ExportEntity);

      await exportRepo.delete({});
      await ProjectsTestUtils.deleteProject(app, token, projectId);
      await OrganizationsTestUtils.deleteOrganization(
        app,
        token,
        organizationId,
      );
      await app.close();
    },
    GivenExportWasRequested: async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/projects/${projectId}/export/`)
        .set('Authorization', `Bearer ${token}`)
        .send({ scenarioIds: [] })
        .expect(201)
        .then((response) => {
          exportId = new ExportId(response.body.id);
        });

      expect(validate(exportId.value)).toEqual(true);
      expect(version(exportId.value)).toEqual(4);

      await delay(2000);
    },
    WhenAnExportPieceJobFails: async ({
      withPendingJobs,
    }: {
      withPendingJobs: boolean;
    }) => {
      const exportInstance = await repo.find(exportId);

      expect(exportInstance).toBeDefined();

      const { exportPieces } = exportInstance!.toSnapshot();

      const [failedPiece, ...rest] = exportPieces;

      if (withPendingJobs) {
        fakePendingJobs = rest.map((piece) => ({
          id: piece.id,
          data: { exportId: exportId.value, componentId: piece.id },
        }));

        expect(fakePendingJobs.length).toBeGreaterThan(0);
      }
      exportPieceQueue.getJobs.mockResolvedValueOnce(fakePendingJobs);

      eventBus.publish(
        new ExportPieceFailed(exportId, new ComponentId(failedPiece.id)),
      );

      await delay(3000);
    },
    ThenExportIsMarkedAsFailed: async () => {
      const apiEvent = await apiEventsService.getLatestEventForTopic({
        kind: API_EVENT_KINDS.project__export__failed__v1__alpha,
        topic: resourceId.value,
      });

      expect(apiEvent).toBeDefined();
      expect(apiEvent.data?.exportId).toEqual(exportId.value);
    },
    ThenPendingExportPieceJobsAreCancelled: async () => {
      expect(exportPieceQueue.remove).toHaveBeenCalledTimes(
        fakePendingJobs.length,
      );
      fakePendingJobs.forEach((fakeJob) => {
        expect(exportPieceQueue.remove).toHaveBeenCalledWith(fakeJob.id);
      });
    },
    ThenCancelledExportPiecesAreMarkedAsFailed: async () => {
      const result = await Promise.all(
        fakePendingJobs.map((job) =>
          apiEventsService.getLatestEventForTopic({
            kind: API_EVENT_KINDS.project__export__piece__failed__v1__alpha,
            topic: job.data.componentId,
          }),
        ),
      );

      expect(
        result.every((apiEvent) => apiEvent.data?.exportId === exportId.value),
      ).toEqual(true);
    },
  };
};
