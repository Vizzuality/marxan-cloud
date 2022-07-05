import { SpecificationOperation } from '@marxan/specification';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Test } from '@nestjs/testing';
import { v4 } from 'uuid';
import { SingleSplitConfigFeatureValue } from './single-config-feature-value';
import { SingleSplitConfigFeatureValueStripped } from './single-config-feature-value.stripped';
import { StripSingleSplitConfigFeatureValue } from './strip-single-split-config-feature-value.service';

describe(StripSingleSplitConfigFeatureValue, () => {
  let fixtures: FixtureType<typeof getFixtures>;
  beforeEach(async () => {
    fixtures = await getFixtures();
  });
  it('strips single split feature value ', () => {
    const singleSplitFeatureValue = fixtures.GivenSingleSplitConfigFeatureValue();

    const result = fixtures.WhenStrippingSingleSplitConfifFeatureValue(
      singleSplitFeatureValue,
    );

    fixtures.ThenSingleSplitConfigFeatureIsStripped(result);
  });

  it('strips single split feature value with out subset ', () => {
    const singleSplitFeatureValue = fixtures.GivenSingleSplitConfigFeatureValue(
      { withSubset: false },
    );

    const result = fixtures.WhenStrippingSingleSplitConfifFeatureValue(
      singleSplitFeatureValue,
    );

    fixtures.ThenSingleSplitConfigFeatureIsStripped(result, {
      withSubset: false,
    });
  });
});

const getFixtures = async () => {
  const sandbox = await Test.createTestingModule({
    imports: [],
    providers: [StripSingleSplitConfigFeatureValue],
  }).compile();

  await sandbox.init();

  const sut = sandbox.get(StripSingleSplitConfigFeatureValue);

  const subsetValue = 'random value';

  const singleSplitConfigFeatureValue = (
    withSubset: boolean,
  ): SingleSplitConfigFeatureValue => ({
    baseFeatureId: v4(),
    operation: SpecificationOperation.Split,
    splitByProperty: 'random property',
    subset: withSubset
      ? { value: subsetValue, fpf: 3, prop: 0.1, target: 100 }
      : undefined,
  });

  return {
    GivenSingleSplitConfigFeatureValue: (
      opts: {
        withSubset: boolean;
      } = { withSubset: true },
    ) => singleSplitConfigFeatureValue(opts.withSubset),
    WhenStrippingSingleSplitConfifFeatureValue: (
      input: SingleSplitConfigFeatureValue,
    ) => sut.execute(input),
    ThenSingleSplitConfigFeatureIsStripped(
      input: SingleSplitConfigFeatureValueStripped,
      opts: {
        withSubset: boolean;
      } = { withSubset: true },
    ) {
      const { value, ...rest } = input;
      expect(input).toEqual({
        ...rest,
        value: opts.withSubset ? subsetValue : undefined,
      });
    },
  };
};
