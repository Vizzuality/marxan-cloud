import { ApiEventsService } from '@marxan-api/modules/api-events';
import {
  ScenarioChecker,
  scenarioDoesntExist,
  ScenarioDoesntExist,
} from '@marxan-api/modules/scenarios/scenario-checker/scenario-checker.service';
import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Either } from 'fp-ts/lib/Either';
import { FindConditions, Repository } from 'typeorm';
import { v4 } from 'uuid';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ApiEventByTopicAndKind } from '@marxan-api/modules/api-events/api-event.topic+kind.api.entity';
import { MarxanScenarioChecker } from './marxan-scenario-checker.service';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

it(`hasPendingExport() should return scenarioDoesntExist if the scenario does not exist`, async () => {
  fixtures.GivenScenarioDoesntExist();

  const result = await fixtures.WhenHasPendingExportMethodIsCalled(v4());

  fixtures.ThenScenarioDoesntExistIsReturned(result);
});

it(`hasPendingExport() should return false if given scenario does not have an ongoing export`, async () => {
  const id = fixtures.GivenScenarioExist();

  const result = await fixtures.WhenHasPendingExportMethodIsCalled(id);

  fixtures.ThenFalseIsReturned(result);
});

it(`hasPendingExport() should return true if given scenario has an ongoing export`, async () => {
  const id = fixtures.GivenScenarioExist();
  fixtures.GivenScenarioHasAnOngoingExport();

  const result = await fixtures.WhenHasPendingExportMethodIsCalled(id);

  fixtures.ThenTrueIsReturned(result);
});

it(`hasPendingImport() should return scenarioDoesntExist if the scenario does not exist`, async () => {
  fixtures.GivenScenarioDoesntExist();

  const result = await fixtures.WhenHasPendingImportMethodIsCalled(v4());

  fixtures.ThenScenarioDoesntExistIsReturned(result);
});

it(`hasPendingImport() should return false if given scenario does not have an ongoing import`, async () => {
  const id = fixtures.GivenScenarioExist();

  const result = await fixtures.WhenHasPendingImportMethodIsCalled(id);

  fixtures.ThenFalseIsReturned(result);
});

it(`hasPendingImport() should return true if given scenario has an ongoing import`, async () => {
  const id = fixtures.GivenScenarioExist();
  fixtures.GivenScenarioHasAnOngoingImport();

  const result = await fixtures.WhenHasPendingImportMethodIsCalled(id);

  fixtures.ThenTrueIsReturned(result);
});

it(`hasPendingBlmCalibration() should return scenarioDoesntExist if the scenario does not exist`, async () => {
  fixtures.GivenScenarioDoesntExist();

  const result = await fixtures.WhenHasPendingBlmCalibrationMethodIsCalled(
    v4(),
  );

  fixtures.ThenScenarioDoesntExistIsReturned(result);
});

it(`hasPendingBlmCalibration() should return false if given scenario does not have an ongoing blm calibration`, async () => {
  const id = fixtures.GivenScenarioExist();

  const result = await fixtures.WhenHasPendingBlmCalibrationMethodIsCalled(id);

  fixtures.ThenFalseIsReturned(result);
});

it(`hasPendingBlmCalibration() should return true if given scenario has an ongoing blm calibration`, async () => {
  const id = fixtures.GivenScenarioExist();
  fixtures.GivenScenarioHasAnOngoingBlmCalibration();

  const result = await fixtures.WhenHasPendingBlmCalibrationMethodIsCalled(id);

  fixtures.ThenTrueIsReturned(result);
});

it(`hasPendingMarxanRun() should return scenarioDoesntExist if the scenario does not exist`, async () => {
  fixtures.GivenScenarioDoesntExist();

  const result = await fixtures.WhenHasPendingMarxanRunMethodIsCalled(v4());

  fixtures.ThenScenarioDoesntExistIsReturned(result);
});

it(`hasPendingMarxanRun() should return false if given scenario does not have an ongoing marxan run`, async () => {
  const id = fixtures.GivenScenarioExist();

  const result = await fixtures.WhenHasPendingMarxanRunMethodIsCalled(id);

  fixtures.ThenFalseIsReturned(result);
});

it(`hasPendingMarxanRun() should return true if given scenario has an ongoing marxan run`, async () => {
  const id = fixtures.GivenScenarioExist();
  fixtures.GivenScenarioHasAnOngoingMarxanRun();

  const result = await fixtures.WhenHasPendingMarxanRunMethodIsCalled(id);

  fixtures.ThenTrueIsReturned(result);
});

async function getFixtures() {
  const fakeApiEventsService: jest.Mocked<
    Pick<ApiEventsService, 'getLatestEventForTopic'>
  > = {
    getLatestEventForTopic: jest.fn<any, any>(async () => {
      throw new NotFoundException();
    }),
  };
  const fakeScenariosRepo: jest.Mocked<
    Pick<Repository<Scenario>, 'findOne'>
  > = {
    findOne: jest.fn(() => Promise.resolve({} as Scenario)),
  };
  const testingModule = await Test.createTestingModule({
    providers: [
      {
        provide: ApiEventsService,
        useValue: fakeApiEventsService,
      },
      {
        provide: getRepositoryToken(Scenario),
        useValue: fakeScenariosRepo,
      },
      {
        provide: ScenarioChecker,
        useClass: MarxanScenarioChecker,
      },
    ],
  }).compile();
  const sut = testingModule.get(ScenarioChecker);

  return {
    GivenScenarioExist: () => {
      const id = v4();
      fakeScenariosRepo.findOne.mockImplementation(
        (_id: string | undefined | FindConditions<Scenario>) =>
          Promise.resolve({ id } as Scenario),
      );

      return id;
    },
    GivenScenarioDoesntExist: () => {
      fakeScenariosRepo.findOne.mockImplementation(
        (_id: string | undefined | FindConditions<Scenario>) =>
          Promise.resolve(undefined),
      );
    },
    GivenScenarioHasAnOngoingExport: () => {
      fakeApiEventsService.getLatestEventForTopic.mockResolvedValueOnce({
        kind: API_EVENT_KINDS.scenario__export__submitted__v1__alpha,
      } as ApiEventByTopicAndKind);
    },
    GivenScenarioHasAnOngoingImport: () => {
      fakeApiEventsService.getLatestEventForTopic.mockResolvedValueOnce({
        kind: API_EVENT_KINDS.scenario__import__submitted__v1__alpha,
      } as ApiEventByTopicAndKind);
    },
    GivenScenarioHasAnOngoingBlmCalibration: () => {
      fakeApiEventsService.getLatestEventForTopic.mockResolvedValueOnce({
        kind: API_EVENT_KINDS.scenario__calibration__submitted_v1_alpha1,
      } as ApiEventByTopicAndKind);
    },
    GivenScenarioHasAnOngoingMarxanRun: () => {
      fakeApiEventsService.getLatestEventForTopic.mockResolvedValueOnce({
        kind: API_EVENT_KINDS.scenario__run__submitted__v1__alpha1,
      } as ApiEventByTopicAndKind);
    },
    WhenHasPendingExportMethodIsCalled: (scenarioId: string) => {
      return sut.hasPendingExport(scenarioId);
    },
    WhenHasPendingImportMethodIsCalled: (scenarioId: string) => {
      return sut.hasPendingImport(scenarioId);
    },
    WhenHasPendingBlmCalibrationMethodIsCalled: (scenarioId: string) => {
      return sut.hasPendingBlmCalibration(scenarioId);
    },
    WhenHasPendingMarxanRunMethodIsCalled: (scenarioId: string) => {
      return sut.hasPendingMarxanRun(scenarioId);
    },
    ThenScenarioDoesntExistIsReturned: (
      result: Either<ScenarioDoesntExist, boolean>,
    ) => {
      expect(result).toEqual({
        _tag: 'Left',
        left: scenarioDoesntExist,
      });
    },
    ThenFalseIsReturned: (result: Either<ScenarioDoesntExist, boolean>) => {
      expect(result).toEqual({
        _tag: 'Right',
        right: false,
      });
    },
    ThenTrueIsReturned: (result: Either<ScenarioDoesntExist, boolean>) => {
      expect(result).toEqual({
        _tag: 'Right',
        right: true,
      });
    },
  };
}
