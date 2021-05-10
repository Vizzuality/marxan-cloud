import { WdpaArenaCalculationService } from './wdpa-arena-calculation.service';
import { Test } from '@nestjs/testing';
import {
  scenarioWithAllWatchedEmpty,
  scenarioWithAllWatchedPresent,
} from './__mocks__/scenario.data';
import {
  emptyWatchedChangeSet,
  fullWatchedChangeSet,
  thresholdChangeSet,
} from './__mocks__/input-change.data';

let sut: WdpaArenaCalculationService;

beforeEach(async () => {
  const sandbox = await Test.createTestingModule({
    providers: [WdpaArenaCalculationService],
  }).compile();

  sut = sandbox.get(WdpaArenaCalculationService);
});

describe(`when scenario has empty watched data`, () => {
  test.each([
    emptyWatchedChangeSet(),
    fullWatchedChangeSet(),
    thresholdChangeSet(),
  ])(`should not tell to trigger calculations`, (input) => {
    expect(sut.shouldTrigger(scenarioWithAllWatchedEmpty(), input)).toEqual(
      false,
    );
  });
});

describe(`when scenario has insufficient watched data`, () => {
  test.each([
    emptyWatchedChangeSet(),
    fullWatchedChangeSet(),
    thresholdChangeSet(),
  ])(`should not tell to trigger calculations`, (input) => {
    expect(
      sut.shouldTrigger(
        {
          ...scenarioWithAllWatchedEmpty(),
          wdpaThreshold: 30,
        },
        input,
      ),
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

  describe(`when input changes contain watched properties`, () => {
    it(`should tell to trigger calculations`, () => {
      expect(
        sut.shouldTrigger(
          scenarioWithAllWatchedPresent(),
          thresholdChangeSet(),
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
