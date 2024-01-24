import { bootstrapApplication } from '../../utils/api-application';
import {
  GivenUserIsLoggedIn,
  userObj,
} from '../../steps/given-user-is-logged-in';
import { GivenProjectExists } from '../../steps/given-project';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as archiver from 'archiver';
import { readableToBuffer } from '@marxan/utils';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import * as request from 'supertest';
import * as unzipper from 'unzipper';
import { HttpStatus } from '@nestjs/common';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { OutputProjectSummaryApiEntity } from '@marxan-api/modules/projects/output-project-summaries/output-project-summary.api.entity';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
}, 12_000);

describe('Projects - Output Project Summary', () => {
  it('when project summary is not found for a given project, return error', async () => {
    await fixtures.GivenNoOutputSummaryForProject();
    const response = await fixtures.WhenGettingOutputProjectSummaryWithError();
    fixtures.ThenNotFoundErrorIsReturned(response);
  });

  it("should download a proper zip file with the project's summary", async () => {
    // NOTE: The exact contents of the zip file and CSV format is tested more thoroughly on output-project-summaries.e2e-spec.ts
    await fixtures.GivenTestOutputSummaryForProjectExists();
    const response = await fixtures.WhenGettingOutputProjectSummary();
    await fixtures.ThenValidZipWasReturned(response);
  });
});

async function getFixtures() {
  const app = await bootstrapApplication([], []);
  const ownerToken = await GivenUserIsLoggedIn(app, 'aa');

  const { projectId } = await GivenProjectExists(app, ownerToken);

  const outputProjectSummariesRepo: Repository<OutputProjectSummaryApiEntity> =
    app.get(getRepositoryToken(OutputProjectSummaryApiEntity));

  const projectRepo: Repository<Project> = app.get(getRepositoryToken(Project));

  return {
    cleanup: async () => {
      await projectRepo.delete({});
      await app.close();
    },
    GivenUserIsLoggedIn: async (user: string) => {
      const userToken = userObj[user as keyof typeof userObj];

      return await GivenUserIsLoggedIn(app, userToken);
    },
    GivenNoOutputSummaryForProject: async () => {
      await outputProjectSummariesRepo.delete({ projectId });
    },
    GivenTestOutputSummaryForProjectExists: async () => {
      const summaryZipStream = archiver('zip', { zlib: { level: 9 } });
      summaryZipStream.append('This is a test of super awesome zipping', {
        name: 'awesome-test.txt',
      });
      await summaryZipStream.finalize();
      const summaryZippedData = await readableToBuffer(summaryZipStream);

      await outputProjectSummariesRepo.insert({ projectId, summaryZippedData });
    },

    WhenGettingOutputProjectSummaryWithError: async () =>
      await request(app.getHttpServer())
        .get(`/api/v1/projects/${projectId}/output-summary`)
        .set('Authorization', `Bearer ${ownerToken}`),
    WhenGettingOutputProjectSummary: async () =>
      await request(app.getHttpServer())
        .get(`/api/v1/projects/${projectId}/output-summary`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .responseType('application/zip'),

    ThenNotFoundErrorIsReturned: (response: request.Response) => {
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      expect(response.body.errors[0].title).toEqual(
        `Output Summary for Project with id: ${projectId} not found`,
      );
    },
    ThenValidZipWasReturned: async (response: request.Response) => {
      expect(response.header['content-type']).toEqual('application/zip');
      expect(response.header[`content-disposition`]).toEqual(
        `attachment; filename="output-summary-${projectId}"`,
      );

      const directory = await unzipper.Open.buffer(response.body);
      expect(directory.files.length).toEqual(1);
      expect(directory.files[0].path).toEqual(`awesome-test.txt`);
      expect((await directory.files[0].buffer()).toString()).toEqual(
        `This is a test of super awesome zipping`,
      );
    },
  };
}
