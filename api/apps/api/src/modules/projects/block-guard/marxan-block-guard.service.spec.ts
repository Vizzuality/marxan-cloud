import { BlockGuard } from '@marxan-api/modules/projects/block-guard/block-guard.service';
import { MarxanBlockGuard } from '@marxan-api/modules/projects/block-guard/marxan-block-guard.service';
import { ProjectChecker } from '@marxan-api/modules/projects/project-checker/project-checker.service';
import { ScenarioChecker } from '@marxan-api/modules/scenarios/scenario-checker/scenario-checker.service';
import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ScenarioCheckerFake } from '../../../../test/utils/scenario-checker.service-fake';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';
import { ProjectCheckerFake } from '../../../../test/utils/project-checker.service-fake';
import { Project } from '../project.api.entity';
import { NotFoundException } from '@nestjs/common';

describe('MarxanBlockGuard - ensureThatProjectIsNotBlocked', () => {
  let fixtures: FixtureType<typeof getFixtures>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  afterEach(() => {
    fixtures?.cleanup();
  });

  it(`throws an exception if the project does not exist`, async () => {
    const projectId = 'foo bar';

    await fixtures
      .WhenCheckingWhetherTheProjectCanBeEdited(projectId)
      .ThenANotFoundExceptionIsThrown();
  });

  it(`throws an exception if the given project has an ongoing export`, async () => {
    const [projectId] = fixtures.GivenProjectWasCreated();

    fixtures.WhenProjectHasAnOngoingExport(projectId);

    await fixtures
      .WhenCheckingWhetherTheProjectCanBeEdited(projectId)
      .ThenAPendingExportErrorIsThrown();
  });

  it(`throws an exception if the given project has a scenario with an ongoing export`, async () => {
    const [projectId, scenarioId] = fixtures.GivenProjectWasCreated();

    fixtures.WhenProjectHasAScenarioWithAnOngoingExport(scenarioId);

    await fixtures
      .WhenCheckingWhetherTheProjectCanBeEdited(projectId)
      .ThenAPendingExportErrorIsThrown();
  });

  it(`throws an exception if the given project has an ongoing import`, async () => {
    const [projectId] = fixtures.GivenProjectWasCreated();

    fixtures.WhenProjectHasAnOngoingImport(projectId);

    await fixtures
      .WhenCheckingWhetherTheProjectCanBeEdited(projectId)
      .ThenAPendingImportErrorIsThrown();
  });

  it(`throws an exception if the given project has a scenario with an ongoing import`, async () => {
    const [projectId, scenarioId] = fixtures.GivenProjectWasCreated();

    fixtures.WhenProjectHasAScenarioWithAnOngoingImport(scenarioId);

    await fixtures
      .WhenCheckingWhetherTheProjectCanBeEdited(projectId)
      .ThenAPendingImportErrorIsThrown();
  });

  it(`throws an exception if the given project has a scenario with an ongoing blm calibration`, async () => {
    const [projectId, scenarioId] = fixtures.GivenProjectWasCreated();

    fixtures.WhenProjectHasAScenarioWithAnOngoingBlmCalibration(scenarioId);

    await fixtures
      .WhenCheckingWhetherTheProjectCanBeEdited(projectId)
      .ThenAPendingBlmCalibrationErrorIsThrown();
  });

  it(`throws an exception if the given project has a scenario with an ongoing marxan run`, async () => {
    const [projectId, scenarioId] = fixtures.GivenProjectWasCreated();

    fixtures.WhenProjectHasAScenarioWithAnOngoingMarxanRun(scenarioId);

    await fixtures
      .WhenCheckingWhetherTheProjectCanBeEdited(projectId)
      .ThenAPendingMarxanRunErrorIsThrown();
  });

  it(`does nothing if the given project is not blocked`, async () => {
    const [projectId] = fixtures.GivenProjectWasCreated();

    await fixtures
      .WhenCheckingWhetherTheProjectCanBeEdited(projectId)
      .ThenNoExceptionIsThrown();
  });
});

describe('MarxanBlockGuard - ensureThatScenarioIsNotBlocked', () => {
  let fixtures: FixtureType<typeof getFixtures>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  afterEach(() => {
    fixtures?.cleanup();
  });

  it(`throws an exception if the scenario does not exist`, async () => {
    const scenario = 'foo bar';

    await fixtures
      .WhenCheckingWhetherTheScenarioCanBeEdited(scenario)
      .ThenANotFoundExceptionIsThrown();
  });

  it(`throws an exception if the given scenario has an ongoing export`, async () => {
    const [_, scenarioId] = fixtures.GivenProjectWasCreated();

    fixtures.WhenProjectHasAScenarioWithAnOngoingExport(scenarioId);

    await fixtures
      .WhenCheckingWhetherTheScenarioCanBeEdited(scenarioId)
      .ThenAPendingExportErrorIsThrown();
  });

  it(`throws an exception if the given scenario's parent project has an ongoing export`, async () => {
    const [projectId, scenarioId] = fixtures.GivenProjectWasCreated();

    fixtures.WhenProjectHasAnOngoingExport(projectId);

    await fixtures
      .WhenCheckingWhetherTheScenarioCanBeEdited(scenarioId)
      .ThenAPendingProjectExportErrorIsThrown();
  });

  it(`throws an exception if the given scenario has an ongoing import`, async () => {
    const [_, scenarioId] = fixtures.GivenProjectWasCreated();

    fixtures.WhenProjectHasAScenarioWithAnOngoingImport(scenarioId);

    await fixtures
      .WhenCheckingWhetherTheScenarioCanBeEdited(scenarioId)
      .ThenAPendingImportErrorIsThrown();
  });

  it(`throws an exception if the given scenario's parent project has an ongoing import`, async () => {
    const [projectId, scenarioId] = fixtures.GivenProjectWasCreated();

    fixtures.WhenProjectHasAnOngoingImport(projectId);

    await fixtures
      .WhenCheckingWhetherTheScenarioCanBeEdited(scenarioId)
      .ThenAPendingProjectImportErrorIsThrown();
  });

  it(`throws an exception if the given scenario has an ongoing blm calibration`, async () => {
    const [_, scenarioId] = fixtures.GivenProjectWasCreated();

    fixtures.WhenProjectHasAScenarioWithAnOngoingBlmCalibration(scenarioId);

    await fixtures
      .WhenCheckingWhetherTheScenarioCanBeEdited(scenarioId)
      .ThenAPendingBlmCalibrationErrorIsThrown();
  });

  it(`throws an exception if the given scenario has an ongoing marxan run`, async () => {
    const [_, scenarioId] = fixtures.GivenProjectWasCreated();

    fixtures.WhenProjectHasAScenarioWithAnOngoingMarxanRun(scenarioId);

    await fixtures
      .WhenCheckingWhetherTheScenarioCanBeEdited(scenarioId)
      .ThenAPendingMarxanRunErrorIsThrown();
  });

  it(`does nothing if the given scenario is not blocked`, async () => {
    const [_, scenarioId] = fixtures.GivenProjectWasCreated();

    await fixtures
      .WhenCheckingWhetherTheScenarioCanBeEdited(scenarioId)
      .ThenNoExceptionIsThrown();
  });
});

const getFixtures = async () => {
  const fakeProjectsRepo: jest.Mocked<Pick<Repository<Project>, 'findOne'>> = {
    findOne: jest.fn(),
  };

  const fakeScenariosRepo: jest.Mocked<Pick<Repository<Scenario>, 'findOne'>> =
    {
      findOne: jest.fn(),
    };

  const sandbox = await Test.createTestingModule({
    providers: [
      {
        provide: ProjectChecker,
        useClass: ProjectCheckerFake,
      },
      {
        provide: ScenarioChecker,
        useClass: ScenarioCheckerFake,
      },
      {
        provide: BlockGuard,
        useClass: MarxanBlockGuard,
      },
      {
        provide: getRepositoryToken(Project),
        useValue: fakeProjectsRepo,
      },
      {
        provide: getRepositoryToken(Scenario),
        useValue: fakeScenariosRepo,
      },
    ],
  }).compile();
  await sandbox.init();
  const projectChecker = sandbox.get(ProjectChecker) as ProjectCheckerFake;
  const scenarioChecker = sandbox.get(ScenarioChecker) as ScenarioCheckerFake;
  const blockGuard = sandbox.get(BlockGuard);

  return {
    cleanup: () => {
      projectChecker.clear();
      scenarioChecker.clear();
    },
    GivenProjectWasCreated: () => {
      const projectId = v4();
      const scenarioId = v4();
      fakeProjectsRepo.findOne.mockResolvedValue({
        id: projectId,
        scenarios: [{ id: scenarioId }],
      } as Project);
      fakeScenariosRepo.findOne.mockResolvedValue({
        id: scenarioId,
        projectId,
      } as Scenario);

      return [projectId, scenarioId];
    },
    WhenProjectHasAScenarioWithAnOngoingExport: (scenarioId: string) => {
      scenarioChecker.addPendingExportForScenario(scenarioId);
    },
    WhenProjectHasAScenarioWithAnOngoingImport: (scenarioId: string) => {
      scenarioChecker.addPendingImportForScenario(scenarioId);
    },
    WhenProjectHasAScenarioWithAnOngoingBlmCalibration: (
      scenarioId: string,
    ) => {
      scenarioChecker.addPendingBlmCalibrationForScenario(scenarioId);
    },
    WhenProjectHasAScenarioWithAnOngoingMarxanRun: (scenarioId: string) => {
      scenarioChecker.addPendingMarxanRunForScenario(scenarioId);
    },
    WhenProjectHasAnOngoingExport: (projectId: string) => {
      projectChecker.addPendingExportForProject(projectId);
    },
    WhenProjectHasAnOngoingImport: (projectId: string) => {
      projectChecker.addPendingImportForProject(projectId);
    },
    WhenCheckingWhetherTheProjectCanBeEdited: (projectId: string) => {
      return {
        ThenAPendingExportErrorIsThrown: async () => {
          await expect(
            blockGuard.ensureThatProjectIsNotBlocked(projectId),
          ).rejects.toThrow(/project.+pending export/gi);
        },
        ThenAPendingImportErrorIsThrown: async () => {
          await expect(
            blockGuard.ensureThatProjectIsNotBlocked(projectId),
          ).rejects.toThrow(/project.+pending import/gi);
        },
        ThenAPendingBlmCalibrationErrorIsThrown: async () => {
          await expect(
            blockGuard.ensureThatProjectIsNotBlocked(projectId),
          ).rejects.toThrow(/pending blm calibration/gi);
        },
        ThenAPendingMarxanRunErrorIsThrown: async () => {
          await expect(
            blockGuard.ensureThatProjectIsNotBlocked(projectId),
          ).rejects.toThrow(/pending marxan run/gi);
        },
        ThenANotFoundExceptionIsThrown: async () => {
          await expect(
            blockGuard.ensureThatProjectIsNotBlocked(projectId),
          ).rejects.toThrow(NotFoundException);
        },
        ThenNoExceptionIsThrown: async () => {
          await expect(
            blockGuard.ensureThatProjectIsNotBlocked(projectId),
          ).resolves.not.toThrow();
        },
      };
    },
    WhenCheckingWhetherTheScenarioCanBeEdited: (scenarioId: string) => {
      return {
        ThenNoExceptionIsThrown: async () => {
          await expect(
            blockGuard.ensureThatScenarioIsNotBlocked(scenarioId),
          ).resolves.not.toThrow();
        },
        ThenANotFoundExceptionIsThrown: async () => {
          await expect(
            blockGuard.ensureThatScenarioIsNotBlocked(scenarioId),
          ).rejects.toThrow(NotFoundException);
        },
        ThenAPendingExportErrorIsThrown: async () => {
          await expect(
            blockGuard.ensureThatScenarioIsNotBlocked(scenarioId),
          ).rejects.toThrow(/scenario.+pending export/gi);
        },
        ThenAPendingImportErrorIsThrown: async () => {
          await expect(
            blockGuard.ensureThatScenarioIsNotBlocked(scenarioId),
          ).rejects.toThrow(/scenario.+pending import/gi);
        },
        ThenAPendingProjectExportErrorIsThrown: async () => {
          await expect(
            blockGuard.ensureThatScenarioIsNotBlocked(scenarioId),
          ).rejects.toThrow(/scenario.+project pending export/gi);
        },
        ThenAPendingProjectImportErrorIsThrown: async () => {
          await expect(
            blockGuard.ensureThatScenarioIsNotBlocked(scenarioId),
          ).rejects.toThrow(/scenario.+project pending import/gi);
        },
        ThenAPendingBlmCalibrationErrorIsThrown: async () => {
          await expect(
            blockGuard.ensureThatScenarioIsNotBlocked(scenarioId),
          ).rejects.toThrow(/scenario.+pending blm calibration/gi);
        },
        ThenAPendingMarxanRunErrorIsThrown: async () => {
          await expect(
            blockGuard.ensureThatScenarioIsNotBlocked(scenarioId),
          ).rejects.toThrow(/scenario.+pending marxan run/gi);
        },
      };
    },
  };
};
