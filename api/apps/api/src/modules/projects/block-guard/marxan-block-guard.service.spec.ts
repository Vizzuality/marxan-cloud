import { BlockGuard } from '@marxan-api/modules/projects/block-guard/block-guard.service';
import { MarxanBlockGuard } from '@marxan-api/modules/projects/block-guard/marxan-block-guard.service';
import { ProjectChecker } from '@marxan-api/modules/projects/project-checker/project-checker.service';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';
import { ProjectCheckerFake } from '../../../../test/utils/project-checker.service-fake';
import { Project } from '../project.api.entity';

describe('MarxanBlockGuard', () => {
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
  const fakeProjectsService: jest.Mocked<
    Pick<Repository<Project>, 'findOne'>
  > = {
    findOne: jest.fn(),
  };

  const sandbox = await Test.createTestingModule({
    providers: [
      {
        provide: ProjectChecker,
        useClass: ProjectCheckerFake,
      },
      {
        provide: BlockGuard,
        useClass: MarxanBlockGuard,
      },
      {
        provide: getRepositoryToken(Project),
        useValue: fakeProjectsService,
      },
    ],
  }).compile();
  await sandbox.init();
  const projectChecker = sandbox.get(ProjectChecker) as ProjectCheckerFake;
  const blockGuard = sandbox.get(BlockGuard);

  return {
    GivenProjectWasCreated: () => {
      const id = v4();
      fakeProjectsService.findOne.mockResolvedValueOnce({ id } as Project);
      return id;
    },
    WhenExportIsRequested: async (projectId: string) => {
      await projectChecker.addPendingExportForProject(projectId);
    },
    WhenCheckingWhetherTheProjectCanBeEdited: (projectId: string) => {
      return {
        ThenAnExceptionIsThrown: async () => {
          await expect(
            blockGuard.ensureThatProjectIsNotBlocked(projectId),
          ).rejects.toThrow(
            `Project ${projectId} editing is blocked because of pending export`,
          );
        },
        ThenNoExceptionIsThrown: async () => {
          await expect(
            blockGuard.ensureThatProjectIsNotBlocked(projectId),
          ).resolves.not.toThrow();
        },
      };
    },
  };
};
