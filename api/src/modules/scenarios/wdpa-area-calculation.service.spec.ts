import { WdpaAreaCalculationService } from './wdpa-area-calculation.service';
import { Test } from '@nestjs/testing';
import {
  scenarioWithRequiredWatchedEmpty,
  scenarioWithAllWatchedPresent,
  scenarioWithwdpaCategoriesWatchedPresent,
  scenarioWithwdpaCategoriesAndCustomWdpaWatchedPresent,
} from './__mocks__/scenario.data';
import {
  emptyWatchedChangeSet,
  fullWatchedChangeSet,
  partialWatchedChangeSet,
  thresholdChangeSet,
} from './__mocks__/input-change.data';


let sut: WdpaAreaCalculationService;

beforeEach(async () => {
  const sandbox = await Test.createTestingModule({
    providers: [WdpaAreaCalculationService],
  }).compile();

  sut = sandbox.get(WdpaAreaCalculationService);
});

describe(`When new scenario has insufficient watched data`, () => {
  it(`should not tell to trigger calculations`, () => {
    expect(
      sut.shouldTrigger(scenarioWithRequiredWatchedEmpty(), emptyWatchedChangeSet()),
    ).toEqual(false);
  });

});
describe(`When new scenario has partial data`, () => {
  test.each([
    scenarioWithwdpaCategoriesWatchedPresent(),
    scenarioWithwdpaCategoriesAndCustomWdpaWatchedPresent(),
    scenarioWithAllWatchedPresent(),
  ])(`should not tell to trigger calculations`, (input) => {
      expect(
        sut.shouldTrigger(
          input,
          emptyWatchedChangeSet(),
        ),
      ).toEqual(false);
    });
    describe(`but should trigger attachement pu to scenario`, () => {});
});

describe(`when scenario has partial data`, () => {
  describe(`when input changes are empty`, () => {
    it(`should not tell to trigger calculations`, () => {
      expect(
        sut.shouldTrigger(
          scenarioWithwdpaCategoriesAndCustomWdpaWatchedPresent(),
          emptyWatchedChangeSet(),
        ),
      ).toEqual(false);
    });
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
  describe(`when input changes contain watched properties`, () => {
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
