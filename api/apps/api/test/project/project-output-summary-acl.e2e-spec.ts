import { bootstrapApplication } from '../utils/api-application';
import { GivenUserIsLoggedIn, userObj } from '../steps/given-user-is-logged-in';
import { GivenUserIsCreated } from '../steps/given-user-is-created';
import { GivenProjectExists } from '../steps/given-project';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OutputProjectSummaryApiEntity } from '@marxan/output-project-summaries';
import * as archiver from 'archiver';
import { readableToBuffer } from '@marxan/utils';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import * as request from 'supertest';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { outputProjectSummaryResource } from '@marxan/output-project-summaries/output-project-summary.api.entity';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
}, 100000);

describe('Projects - Output Project Summary ACL', () => {
  it("when getting the output summary from an user that doesn't have any permissions to view the project, it should return forbidden error", async () => {
    await fixtures.GivenTestOutputSummaryForProjectExists();
    const response = await fixtures.WhenGettingOutputProjectSummary();
    fixtures.ThenForbiddenErrorIsReturned(response);
  }, 1000000);
});

async function getFixtures() {
  const app = await bootstrapApplication([], []);
  const ownerToken = await GivenUserIsLoggedIn(app, 'aa');

  const randomUserInfo = await GivenUserIsCreated(app);

  const { projectId } = await GivenProjectExists(app, ownerToken);

  const projectRepo: Repository<Project> = app.get(getRepositoryToken(Project));
  const outputProjectSummariesRepo: Repository<OutputProjectSummaryApiEntity> = app.get(
    getRepositoryToken(OutputProjectSummaryApiEntity),
  );

  return {
    cleanup: async () => {
      await projectRepo.delete({});
    },
    GivenUserIsLoggedIn: async (user: string) => {
      if (user === 'random') {
        return randomUserInfo.accessToken;
      }
      const userToken = userObj[user as keyof typeof userObj];

      return await GivenUserIsLoggedIn(app, userToken);
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

    WhenGettingOutputProjectSummary: async () =>
      await request(app.getHttpServer())
        .get(`/api/v1/projects/${projectId}/output-summary`)
        .set('Authorization', `Bearer ${randomUserInfo.accessToken}`),

    ThenForbiddenErrorIsReturned: (response: request.Response) => {
      expect(response.body.errors[0].title).toEqual(
        `User with ID: ${randomUserInfo.user.id} is not allowed to perform this action on ${outputProjectSummaryResource.name.singular}.`,
      );
    },
  };
}
