import { WdpaAreaCalculationService } from './wdpa-area-calculation.service';
import { Test } from '@nestjs/testing';
import {
  scenarioWithRequiredWatchedEmpty,
  scenarioWithAllWatchedPresent,
} from './__mocks__/scenario.data';
import {
  emptyWatchedChangeSet,
  fullWatchedChangeSet,
  partialWatchedChangeSet,

} from './__mocks__/input-change.data';

let sut: WdpaAreaCalculationService;

beforeEach(async () => {
  const sandbox = await Test.createTestingModule({
    providers: [WdpaAreaCalculationService],
  }).compile();

  sut = sandbox.get(WdpaAreaCalculationService);
});

describe(`when scenario has insufficient watched data`, () => {
  test.each([
    emptyWatchedChangeSet(),
  ])(`should not tell to trigger calculations`, (input) => {
    expect(
      sut.shouldTrigger(scenarioWithRequiredWatchedEmpty(), input),
    ).toEqual(false);
  });
});

describe(`when scenario has complete data`, () => {
  describe(`when input changes are empty`, () => {
    it(`should not tell to trigger calculations`, () => {
      expect(
        sut.shouldTrigger(
          scenarioWithAllWatchedPresent(),
          emptyWatchedChangeSet(),
        ),
      ).toEqual(false);
    });
  });
  describe(`when input changes contain partial watched properties`, () => {
    it(`should tell to trigger calculations`, () => {
      expect(
        sut.shouldTrigger(
          scenarioWithAllWatchedPresent(),
          partialWatchedChangeSet(),
        ),
      ).toEqual(true);
    });
  });

  describe(`when input changes contain all watched properties`, () => {
    it(`should tell to trigger calculations`, () => {
      expect(
        sut.shouldTrigger(
          scenarioWithAllWatchedPresent(),
          fullWatchedChangeSet(),
        ),
      ).toEqual(true);
    });
  });
});
