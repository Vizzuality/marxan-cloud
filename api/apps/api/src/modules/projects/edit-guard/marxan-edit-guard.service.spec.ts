import { Test } from '@nestjs/testing';
import { EditGuard } from '@marxan-api/modules/projects/edit-guard/edit-guard.service';
import { ProjectChecker } from '@marxan-api/modules/projects/project-checker/project-checker.service';
import { ProjectCheckerFake } from '../../../../test/utils/project-checker.service-fake';
import { v4 } from 'uuid';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { MarxanEditGuard } from '@marxan-api/modules/projects/edit-guard/marxan-edit-guard.service';

describe('MarxanEditGuard', () => {
  let fixtures: FixtureType<typeof getFixtures>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  it(`throws an exception if the given project has an ongoing export`, async () => {
    const projectId = fixtures.GivenProjectWasCreated();

    await fixtures.WhenExportIsRequested(projectId);

    await fixtures
      .WhenCheckingWhetherTheProjectCanBeEdited(projectId)
      .ThenAnExceptionIsThrown();
  });

  it(`does nothing if the given project does not have an ongoing export`, async () => {
    const projectId = fixtures.GivenProjectWasCreated();

    await fixtures
      .WhenCheckingWhetherTheProjectCanBeEdited(projectId)
      .ThenNoExceptionIsThrown();
  });
});

const getFixtures = async () => {
  const sandbox = await Test.createTestingModule({
    providers: [
      {
        provide: ProjectChecker,
        useClass: ProjectCheckerFake,
      },
      {
        provide: EditGuard,
        useClass: MarxanEditGuard,
      },
    ],
  }).compile();
  await sandbox.init();
  const projectChecker = sandbox.get(ProjectChecker) as ProjectCheckerFake;
  const editGuard = sandbox.get(EditGuard);

  return {
    GivenProjectWasCreated: () => {
      return v4();
    },
    WhenExportIsRequested: async (projectId: string) => {
      await projectChecker.addPendingExportForProject(projectId);
    },
    WhenCheckingWhetherTheProjectCanBeEdited: (projectId: string) => {
      return {
        ThenAnExceptionIsThrown: async () => {
          await expect(
            editGuard.ensureEditingIsAllowedFor(projectId),
          ).rejects.toThrow(
            `Project ${projectId} editing is blocked because of pending export`,
          );
        },
        ThenNoExceptionIsThrown: async () => {
          await expect(
            editGuard.ensureEditingIsAllowedFor(projectId),
          ).resolves.not.toThrow();
        },
      };
    },
  };
};
