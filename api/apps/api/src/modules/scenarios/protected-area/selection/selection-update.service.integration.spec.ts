import {
  CommandBus,
  CommandHandler,
  CqrsModule,
  EventBus,
  ICommand,
  IEvent,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Test } from '@nestjs/testing';
import { v4 } from 'uuid';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProjectSnapshot } from '@marxan/projects';
import { ScenarioPlanningUnitsProtectedStatusCalculatorService } from '@marxan/scenarios-planning-unit';

import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';
import {
  ProtectedAreaKind,
  ProtectedAreaUnlinked,
} from '@marxan-api/modules/scenarios/protected-area';
import { CalculatePlanningUnitsProtectionLevel } from '@marxan-api/modules/planning-units-protection-level';

import { ScenarioProtectedArea } from '../scenario-protected-area';
import { SelectionGetService } from '../getter/selection-get.service';

import { SelectionUpdateService } from './selection-update.service';
import { UpdatePlanningUnitsHandler } from './update-planning-units.handler';
import { SelectionChangedSaga } from './selection-changed.saga';
import { ApiEventsService } from '@marxan-api/modules/api-events';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

test(`selecting protected areas`, async () => {
  const customAreaId: string = await fixtures.GivenProtectedAreaIsAvailable(
    `custom area`,
  );
  const globalAreaId: string = await fixtures.GivenProtectedAreaIsAvailable(
    `global area`,
    true,
  );
  const areasToAdd = [globalAreaId];
  fixtures.GivenAreaIsSelected(customAreaId);

  await fixtures.WhenSelecting(areasToAdd);

  await fixtures.ThenScenarioIsUpdated(areasToAdd);
  await fixtures.ThenPlanningUnitStatusCalculationIsTriggered(areasToAdd);
  await fixtures.ThenPlanningUnitProtectionCalculationIsTriggered(areasToAdd);
  await fixtures.ThenProjectCustomAreaUnlinkIsPublished(customAreaId);
});

const getFixtures = async () => {
  const scenarioRepoToken = getRepositoryToken(Scenario);
  const sandbox = await Test.createTestingModule({
    imports: [CqrsModule],
    providers: [
      SelectionUpdateService,
      UpdatePlanningUnitsHandler,
      SelectionChangedSaga,
      CalculatePuHandler,
      {
        provide: SelectionGetService,
        useClass: Selection,
      },
      {
        provide: ScenarioPlanningUnitsProtectedStatusCalculatorService,
        useClass: PlanningUnits,
      },
      {
        provide: scenarioRepoToken,
        useClass: ScenarioRepo,
      },
      {
        provide: ApiEventsService,
        useValue: {
          create: jest.fn(),
        },
      },
    ],
  }).compile();

  await sandbox.init();

  const projectId = v4();
  const scenarioId = v4();

  const sut = sandbox.get(SelectionUpdateService);
  const repo: ScenarioRepo = sandbox.get(scenarioRepoToken);
  const commandBus = sandbox.get(CommandBus);
  const eventBus = sandbox.get(EventBus);
  const handler = sandbox.get(CalculatePuHandler);

  const commands: ICommand[] = [];
  const events: IEvent[] = [];

  commandBus.subscribe((cmd) => commands.push(cmd));
  eventBus.subscribe((event) => events.push(event));

  const areas: ScenarioProtectedArea[] = [];

  const planningUnitsService: PlanningUnits = sandbox.get(
    ScenarioPlanningUnitsProtectedStatusCalculatorService,
  );
  const selectionsGetService: Selection = sandbox.get(SelectionGetService);
  selectionsGetService.getMock.mockImplementation(async () => areas);
  selectionsGetService.getGlobalMock.mockImplementation(async () =>
    areas.reduce(
      (acc, area) => {
        return {
          categories: [],
          areas: {
            ...acc.areas,
            [area.id]: [area.id],
          },
        };
      },
      {
        categories: [],
        areas: {},
      },
    ),
  );

  return {
    GivenProtectedAreaIsAvailable(customArea: string, globalArea?: boolean) {
      const id = v4();
      areas.push({
        id,
        kind: globalArea ? ProtectedAreaKind.Global : ProtectedAreaKind.Project,
        selected: false,
        name: customArea,
      });
      return id;
    },
    GivenAreaIsSelected(customAreaId: string) {
      areas.forEach((area) => {
        if (area.id === customAreaId) {
          area.selected = true;
        }
      });
    },
    WhenSelecting: async (areasToAdd: string[]) => {
      await sut.selectFor(
        {
          id: scenarioId,
          threshold: 50,
          protectedAreaIds: areasToAdd,
        },
        {
          id: projectId,
          bbox: [0, 0, 0, 0, 0, 0],
        },
        areasToAdd.map((id) => ({
          id,
          selected: true,
        })),
      );
    },
    ThenScenarioIsUpdated(areasToAdd: string[]) {
      expect(repo.updateMock.mock.calls[0]).toEqual([
        {
          id: scenarioId,
        },
        {
          protectedAreaFilterByIds: areasToAdd,
          wdpaThreshold: 50,
        },
      ]);
    },
    ThenPlanningUnitStatusCalculationIsTriggered(_areasToAdd: string[]) {
      expect(planningUnitsService.calculateMock.mock.calls[0]).toEqual([
        {
          id: scenarioId,
          threshold: 50,
        },
      ]);
    },
    ThenPlanningUnitProtectionCalculationIsTriggered(areasToAdd: string[]) {
      expect(handler.executeMock.mock.calls[0][0]).toEqual(
        new CalculatePlanningUnitsProtectionLevel(scenarioId, areasToAdd),
      );
    },
    ThenProjectCustomAreaUnlinkIsPublished(customAreaId: string) {
      expect(
        events.find((event) => event instanceof ProtectedAreaUnlinked),
      ).toEqual({
        id: customAreaId,
        projectId,
      });
    },
  };
};

@CommandHandler(CalculatePlanningUnitsProtectionLevel)
class CalculatePuHandler
  implements IInferredCommandHandler<CalculatePlanningUnitsProtectionLevel> {
  executeMock = jest.fn();

  execute(command: CalculatePlanningUnitsProtectionLevel): Promise<void> {
    return this.executeMock(command);
  }
}

class ScenarioRepo implements Pick<Repository<Scenario>, 'update'> {
  updateMock = jest.fn();

  update(criteria: any, partial: any): Promise<any> {
    return this.updateMock(criteria, partial);
  }
}

class Selection
  implements Pick<SelectionGetService, 'getFor' | 'getGlobalProtectedAreas'> {
  getMock: jest.Mocked<
    Pick<SelectionGetService, 'getFor'>
  >['getFor'] = jest.fn();

  getGlobalMock: jest.Mocked<
    Pick<SelectionGetService, 'getGlobalProtectedAreas'>
  >['getGlobalProtectedAreas'] = jest.fn();

  async getFor(
    scenario: { id: string; protectedAreaIds: string[] },
    project: ProjectSnapshot,
  ): Promise<ScenarioProtectedArea[]> {
    return this.getMock(scenario, project);
  }

  async getGlobalProtectedAreas(
    project: any,
  ): Promise<{ categories: string[]; areas: Record<string, string[]> }> {
    return this.getGlobalMock(project);
  }
}

class PlanningUnits
  implements
    Pick<
      ScenarioPlanningUnitsProtectedStatusCalculatorService,
      'calculatedProtectionStatusForPlanningUnitsIn'
    > {
  calculateMock: jest.Mocked<
    Pick<
      ScenarioPlanningUnitsProtectedStatusCalculatorService,
      'calculatedProtectionStatusForPlanningUnitsIn'
    >
  >['calculatedProtectionStatusForPlanningUnitsIn'] = jest.fn();

  async calculatedProtectionStatusForPlanningUnitsIn(
    scenario: any,
  ): Promise<void> {
    return this.calculateMock(scenario);
  }
}
