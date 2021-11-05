import { CommandBus, EventBus, ICommand, IEvent } from '@nestjs/cqrs';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Test } from '@nestjs/testing';

import { ProjectSnapshot } from '@marxan/projects';
import { ScenarioPlanningUnitsProtectedStatusCalculatorService } from '@marxan/scenarios-planning-unit';

import { ScenarioProtectedArea } from '../scenario-protected-area';

import { SelectionUpdateService } from './selection-update.service';
import { SelectionGetService } from './selection-get.service';

let fixtures: FixtureType<typeof getFixtures>;

test(`selecting protected areas`, async () => {
  //
});

const getFixtures = async () => {
  const sandbox = await Test.createTestingModule({
    providers: [
      SelectionUpdateService,
      {
        provide: SelectionGetService,
        useClass: Selection,
      },
      {
        provide: ScenarioPlanningUnitsProtectedStatusCalculatorService,
        useClass: PlanningUnits,
      },
    ],
  }).compile();

  const sut = sandbox.get(SelectionUpdateService);
  const commandBus = sandbox.get(CommandBus);
  const eventBus = sandbox.get(EventBus);

  const commands: ICommand[] = [];
  const events: IEvent[] = [];

  commandBus.subscribe((cmd) => commands.push(cmd));
  eventBus.subscribe((event) => events.push(event));
};

class Selection implements Pick<SelectionGetService, 'getFor'> {
  getMock: jest.Mocked<
    Pick<SelectionGetService, 'getFor'>
  >['getFor'] = jest.fn();

  async getFor(
    scenario: { id: string; protectedAreaIds: string[] },
    project: ProjectSnapshot,
  ): Promise<ScenarioProtectedArea[]> {
    return this.getMock(scenario, project);
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
