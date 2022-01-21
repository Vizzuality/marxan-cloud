import { ExportEntity } from '@marxan-api/modules/clone/export/adapters/entities/exports.api.entity';
import {
  CompletePiece,
  ComponentLocation,
} from '@marxan-api/modules/clone/export/application/complete-piece.command';
import { ExportRepository } from '@marxan-api/modules/clone/export/application/export-repository.port';
import {
  ArchiveReady,
  Export,
  ExportId,
} from '@marxan-api/modules/clone/export/domain';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { CommandBus, EventBus, IEvent } from '@nestjs/cqrs';
import { isLeft } from 'fp-ts/lib/These';
import { Subscription } from 'rxjs';
import { Readable } from 'stream';
import * as request from 'supertest';
import { Connection } from 'typeorm';
import { Class } from 'utility-types';
import { FileRepository } from '../../../../libs/files-repository/src';
import { GivenProjectExists } from '../steps/given-project';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { bootstrapApplication } from '../utils/api-application';
import { OrganizationsTestUtils } from '../utils/organizations.test.utils';
import { ProjectsTestUtils } from '../utils/projects.test.utils';

async function untilEventIsEmitted<T extends IEvent>(
  eventClass: Class<T>,
  eventBus: EventBus,
): Promise<T> {
  let subscription: Subscription;
  const event = await new Promise<T>((resolve) => {
    subscription = eventBus.subscribe((event) => {
      console.log('Event of type:', event.constructor.name);
      if (event instanceof eventClass) {
        resolve(event);
      }
    });
  });

  subscription!.unsubscribe();

  return event;
}

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
}, 10000);

afterEach(async () => {
  // await fixtures?.cleanup();
});

test('should forbid getting export file to non owner users', async () => {
  await fixtures.GivenExportWasRequested();

  await fixtures.WhenExportFileIsReady();
  const response = await fixtures.WhenNonOwnerUserRequestExportFile();

  fixtures.ThenForbiddenIsReturned(response);
}, 150000);

test('should permit getting export file for owner users ', async () => {
  await fixtures.GivenExportWasRequested();

  await fixtures.WhenExportFileIsReady();
  const response = await fixtures.WhenOwnerUserRequestExportFile();

  fixtures.ThenFileIsRetrieved(response);
}, 150000);

export const getFixtures = async () => {
  const app = await bootstrapApplication();
  const eventBus = app.get(EventBus);
  const commandBus = app.get(CommandBus);
  const exportRepo = app.get(ExportRepository);
  const fileRepo = app.get(FileRepository);

  const ownerToken = await GivenUserIsLoggedIn(app, 'aa');
  const notIncludedUserToken = await GivenUserIsLoggedIn(app, 'bb');

  const { projectId, organizationId } = await GivenProjectExists(
    app,
    ownerToken,
  );
  let exportId: ExportId;

  const piecesUris: Record<string, string> = {};
  const savePiecesFiles = async (exportInstance: Export) => {
    await Promise.all(
      exportInstance.toSnapshot().exportPieces.map(async (piece, i) => {
        const result = await fileRepo.save(
          Readable.from(`${piece.piece}`),
          '.txt',
        );

        console.log(i);
        console.dir(piece, { depth: Infinity });

        if (isLeft(result)) {
          throw new Error(`Error while saving ${piece.id.value} file`);
        }

        piecesUris[piece.id.value] = result.right;
      }),
    );
  };

  return {
    cleanup: async () => {
      const connection = app.get<Connection>(Connection);
      const exportRepo = connection.getRepository(ExportEntity);

      await exportRepo.delete({});
      await ProjectsTestUtils.deleteProject(app, ownerToken, projectId);
      await OrganizationsTestUtils.deleteOrganization(
        app,
        ownerToken,
        organizationId,
      );
      await app.close();
    },
    GivenExportWasRequested: async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/projects/${projectId}/export`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(201);

      exportId = new ExportId(response.body.id);

      const exportInstance = await exportRepo.find(exportId);

      expect(exportInstance).toBeDefined();

      await savePiecesFiles(exportInstance!);

      exportInstance!.toSnapshot().exportPieces.forEach((piece) => {
        commandBus.execute(
          new CompletePiece(exportId, piece.id, [
            new ComponentLocation(
              piecesUris[piece.id.value],
              `${piece.id.value}-${piece.piece}.txt`,
            ),
          ]),
        );
      });
    },
    WhenNonOwnerUserRequestExportFile: () =>
      request(app.getHttpServer())
        .get(`/api/v1/projects/${projectId}/export`)
        .set('Authorization', `Bearer ${notIncludedUserToken}`),
    WhenOwnerUserRequestExportFile: () =>
      request(app.getHttpServer())
        .get(`/api/v1/projects/${projectId}/export`)
        .set('Authorization', `Bearer ${ownerToken}`),
    WhenExportFileIsReady: async () => {
      //   await new Promise((resolve) => setTimeout(resolve, 200000));

      await untilEventIsEmitted(ArchiveReady, eventBus);
    },
    ThenFileIsRetrieved: (response: request.Response) => {
      console.dir(response, { depth: Infinity });
      expect(response.status).toBe(200);
    },
    ThenForbiddenIsReturned: (response: request.Response) => {
      console.dir(response, { depth: Infinity });
      expect(response.status).toBe(403);
    },
  };
};
