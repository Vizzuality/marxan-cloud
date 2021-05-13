import { WdpaAreaCalculationService } from './wdpa-area-calculation.service';
import { Test } from '@nestjs/testing';
import { scenarioWithAllWatchedPresent } from './__mocks__/scenario.data';
import {
  minimalScenario,
  fullWatchedChangeSet,
} from './__mocks__/input-change.data';
import { CreateScenarioDTO } from './dto/create.scenario.dto';
import { Scenario } from './scenario.api.entity';
import { UpdateScenarioDTO } from './dto/update.scenario.dto';

let sut: WdpaAreaCalculationService;

beforeEach(async () => {
  const sandbox = await Test.createTestingModule({
    providers: [WdpaAreaCalculationService],
  }).compile();

  sut = sandbox.get(WdpaAreaCalculationService);
});

/**
 * [description, what was provided in dto, Scenario entity after creation, should trigger]
 */

const postCreateCases: [string, CreateScenarioDTO, Scenario, boolean][] = [
  [
    'minimal scenario',
    minimalScenario(),
    scenarioWithAllWatchedPresent(),
    false,
  ],
];

const postUpdateCases: [string, UpdateScenarioDTO, Scenario, boolean][] = [
  [
    'full everything',
    fullWatchedChangeSet(),
    scenarioWithAllWatchedPresent(),
    true,
  ],
];

test.each(postCreateCases)(`%p`, (...[, dto, scenario, result]) => {
  expect(sut.shouldTriggerPostCreate(scenario, dto)).toEqual(result);
});

test.each(postUpdateCases)(`%p`, (...[, dto, scenario, result]) => {
  expect(sut.shouldTriggerPostUpdate(scenario, dto)).toEqual(result);
});
