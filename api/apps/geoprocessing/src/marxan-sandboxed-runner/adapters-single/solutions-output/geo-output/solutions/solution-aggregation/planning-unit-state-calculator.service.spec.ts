import { PlanningUnitSelectionCalculatorService } from './planning-unit-selection-calculator.service';
import { Test } from '@nestjs/testing';
import { PromiseType } from 'utility-types';
import TypedEventEmitter from 'typed-emitter';
import { PassThrough } from 'stream';

import { SolutionsEvents } from '../solutions-events';
import { SolutionRowResult } from '../solution-row-result';

let fixtures: PromiseType<ReturnType<typeof getFixtures>>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

describe(`when a pu is included`, () => {
  let stream: TypedEventEmitter<any>;

  beforeEach(() => {
    stream = new PassThrough() as TypedEventEmitter<any>;
  });

  it(`should return relevant state`, async () => {
    const state = fixtures.sut.consume(stream);
    fixtures.emitSolutions(stream, [
      ['one'],
      ['one', 'five'],
      ['one', 'three'],
      ['four'],
    ]);
    stream.emit('finish');
    const results = await state;

    expect(results.puSelectionState['one']).toEqual({
      values: [true, true, true, false],
      usedCount: 3,
    });
    expect(results.puSelectionState['two']).toEqual({
      values: [false, false, false, false],
      usedCount: 0,
    });
    expect(results.puSelectionState['three']).toEqual({
      values: [false, false, true, false],
      usedCount: 1,
    });
    expect(results.puSelectionState['four']).toEqual({
      values: [false, false, false, true],
      usedCount: 1,
    });
    expect(results.puSelectionState['five']).toEqual({
      values: [false, true, false, false],
      usedCount: 1,
    });

    expect(results.puUsageByRun[0]).toEqual([1, 0, 0, 0, 0]);
    expect(results.puUsageByRun[1]).toEqual([1, 0, 0, 0, 1]);
    expect(results.puUsageByRun[2]).toEqual([1, 0, 1, 0, 0]);
    expect(results.puUsageByRun[3]).toEqual([0, 0, 0, 1, 0]);
  });
});

type AvailableSpdIds = 'one' | 'two' | 'three' | 'four' | 'five';
const getFixtures = async () => {
  const spdIds: AvailableSpdIds[] = ['one', 'two', 'three', 'four', 'five'];
  const sandbox = await Test.createTestingModule({
    providers: [PlanningUnitSelectionCalculatorService],
  }).compile();

  return {
    spdIds: spdIds,
    sut: sandbox.get(PlanningUnitSelectionCalculatorService),
    emitSolutions: (
      stream: TypedEventEmitter<any>,
      solutions: Array<Array<AvailableSpdIds>>,
    ) => {
      solutions.forEach((solution, runId) => {
        stream.emit(
          'data',
          spdIds.map<SolutionRowResult>((existingPuId) => ({
            spdId: existingPuId,
            runId: runId + 1, // runs counts from 1
            value: solution.includes(existingPuId as AvailableSpdIds) ? 1 : 0,
          })),
        );
      });
    },
  };
};
