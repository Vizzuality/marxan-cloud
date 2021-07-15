import { PlanningUnitStateCalculatorService } from './planning-unit-state-calculator.service';
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
  let stream: TypedEventEmitter<SolutionsEvents>;

  beforeEach(() => {
    stream = new PassThrough();
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

    expect(results['one']).toEqual({
      values: [true, true, true, false],
      usedCount: 3,
    });
    expect(results['two']).toEqual({
      values: [false, false, false, false],
      usedCount: 0,
    });
    expect(results['three']).toEqual({
      values: [false, false, true, false],
      usedCount: 1,
    });
    expect(results['four']).toEqual({
      values: [false, false, false, true],
      usedCount: 1,
    });
    expect(results['five']).toEqual({
      values: [false, true, false, false],
      usedCount: 1,
    });
  });
});

type AvailableSpdIds = 'one' | 'two' | 'three' | 'four' | 'five';
const getFixtures = async () => {
  const spdIds: AvailableSpdIds[] = ['one', 'two', 'three', 'four', 'five'];
  const sandbox = await Test.createTestingModule({
    providers: [PlanningUnitStateCalculatorService],
  }).compile();

  return {
    spdIds: spdIds,
    sut: sandbox.get(PlanningUnitStateCalculatorService),
    emitSolutions: (
      stream: TypedEventEmitter<SolutionsEvents>,
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
