import { GeoFeature } from '@marxan-api/modules/geo-features/geo-feature.api.entity';
import { FakeLogger } from '@marxan-api/utils/__mocks__/fake-logger';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Injectable } from '@nestjs/common';
import { CqrsModule, EventBus, IEvent } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { isLeft, isRight } from 'fp-ts/lib/Either';
import { v4 } from 'uuid';
import { ScenarioDeleted } from '../events/scenario-deleted.event';
import { Scenario } from '../scenario.api.entity';
import {
  DeleteScenario,
  deleteScenarioFailed,
  DeleteScenarioResponse,
} from './delete-scenario.command';
import { DeleteScenarioHandler } from './delete-scenario.handler';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

it('deletes a scenario and emits a ScenarioDeleted event', async () => {
  const scenarioId = fixtures.GivenScenarioExits();

  const result = await fixtures.WhenAScenarioIsDeleted(scenarioId);

  fixtures.ThenTrueIsReturned(result);
  await fixtures.ThenScenarioIsDeleted(scenarioId);
  fixtures.ThenAScenarioDeletedEventIsEmitted(scenarioId);
});

it('fails to delete a scenario ', async () => {
  const scenarioId = fixtures.GivenScenarioExits();
  fixtures.GivenDeleteOperationFails();

  const result = await fixtures.WhenAScenarioIsDeleted(scenarioId);

  fixtures.WhenAScenarioDeletionIsRequestedAndFails(result);
  await fixtures.ThenScenarioIsNotDeleted(scenarioId);
  fixtures.ThenNoEventIsEmitted(scenarioId);
});

const getFixtures = async () => {
  const sandbox = await Test.createTestingModule({
    imports: [CqrsModule],
    providers: [
      { provide: getRepositoryToken(Scenario), useClass: FakeScenarioRepo },
      DeleteScenarioHandler,
    ],
  }).compile();
  await sandbox.init();
  sandbox.useLogger(new FakeLogger());

  const scenarioIds = [v4(), v4(), v4()];

  const events: IEvent[] = [];

  const sut = sandbox.get(DeleteScenarioHandler);
  const scenariosRepo: FakeScenarioRepo = sandbox.get(
    getRepositoryToken(Scenario),
  );

  sandbox.get(EventBus).subscribe((event) => {
    events.push(event);
  });

  return {
    GivenScenarioExits: () => {
      const scenarioId = v4();
      scenariosRepo.scenarios.push({
        id: scenarioId,
        scenarios: scenarioIds.map((scenarioId) => ({
          id: scenarioId,
        })),
      });
      return scenarioId;
    },
    GivenDeleteOperationFails: () => {
      scenariosRepo.failDeleteOperation = true;
    },
    WhenAScenarioIsDeleted: async (scenarioId: string) => {
      return sut.execute(new DeleteScenario(scenarioId));
    },
    ThenTrueIsReturned: (result: DeleteScenarioResponse) => {
      if (isLeft(result)) throw new Error('got left expected right');

      expect(result.right).toEqual(true);
    },
    WhenAScenarioDeletionIsRequestedAndFails: (
      result: DeleteScenarioResponse,
    ) => {
      if (isRight(result)) throw new Error('got right expected left');

      expect(result.left).toEqual(deleteScenarioFailed);
    },
    ThenScenarioIsDeleted: async (scenarioId: string) => {
      const scenario = await scenariosRepo.find({ where: { id: scenarioId } });
      expect(scenario).toBeUndefined();
    },
    ThenScenarioIsNotDeleted: async (scenarioId: string) => {
      const scenarios = await scenariosRepo.find({ where: { id: scenarioId } });
      if (!scenarios) throw new Error('got undefined, expected scenario');

      expect(scenarios).toHaveLength(1);
      const scenario = scenarios[0];
      expect(scenario).toEqual({
        id: scenarioId,
        scenarios: scenarioIds.map((scenarioId) => ({
          id: scenarioId,
        })),
      });
    },
    ThenAScenarioDeletedEventIsEmitted: (scenarioId: string) => {
      const scenarioDeletedEvent = events[0];

      expect(scenarioDeletedEvent).toMatchObject({
        scenarioId,
      });
      expect(scenarioDeletedEvent).toBeInstanceOf(ScenarioDeleted);
    },
    ThenNoEventIsEmitted: (scenarioId: string) => {
      expect(events).toHaveLength(0);
    },
  };
};

@Injectable()
class FakeScenarioRepo {
  public scenarios: { id: string; scenarios: { id: string }[] }[] = [];
  public failDeleteOperation = false;
  async find(conditions: { where: { id: string } }) {
    const res = this.scenarios.find(
      (scenario) => scenario.id === conditions.where.id,
    );
    return res ? [res] : undefined;
  }
  async delete(scenarioId: string) {
    if (this.failDeleteOperation) throw new Error('delete operation failed');
    const index = this.scenarios.findIndex(
      (scenario) => scenario.id === scenarioId,
    );
    this.scenarios.splice(index, 1);
  }
}
