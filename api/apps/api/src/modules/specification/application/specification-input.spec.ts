import { v4 } from 'uuid';
import { validateSync } from 'class-validator';
import { plainToClass } from 'class-transformer';
import {
  SpecificationFeatureSplit,
  SpecificationFeatureCopy,
  SpecificationFeatureStratification,
  SpecificationInput,
} from './specification-input';
import { SpecificationOperation } from '../domain/feature-config';

test(`valid values`, () => {
  const errors = validateSync(
    plainToClass<SpecificationInput, SpecificationInput>(SpecificationInput, {
      scenarioId: v4(),
      draft: true,
      raw: {},
      features: [
        plainToClass<
          SpecificationFeatureStratification,
          SpecificationFeatureStratification
        >(SpecificationFeatureStratification, {
          operation: SpecificationOperation.Stratification,
          baseFeatureId: v4(),
          againstFeatureId: v4(),
          splitByProperty: `split-property-stratification`,
        }),
        plainToClass<SpecificationFeatureSplit, SpecificationFeatureSplit>(
          SpecificationFeatureSplit,
          {
            operation: SpecificationOperation.Split,
            baseFeatureId: v4(),
            splitByProperty: `split-property`,
          },
        ),
        plainToClass<SpecificationFeatureCopy, SpecificationFeatureCopy>(
          SpecificationFeatureCopy,
          {
            operation: SpecificationOperation.Copy,
            baseFeatureId: v4(),
            selectSubSets: undefined as never,
          },
        ),
      ],
    }),
  );
  expect(errors.length).toEqual(0);
});

test(`invalid values / types`, () => {
  const errors = validateSync(
    plainToClass<SpecificationInput, SpecificationInput>(SpecificationInput, {
      scenarioId: `non-uuid`,
      draft: `true` as unknown as boolean,
      raw: {},
      features: [
        plainToClass<
          SpecificationFeatureStratification,
          SpecificationFeatureStratification
        >(SpecificationFeatureStratification, {
          operation: SpecificationOperation.Stratification,
          baseFeatureId: `non-uuid-as-well`,
          againstFeatureId: undefined as unknown as string,
          splitByProperty: `split-property-stratification`,
        }),
        plainToClass<SpecificationFeatureCopy, SpecificationFeatureCopy>(
          SpecificationFeatureCopy,
          {
            operation:
              `invalid operation` as unknown as SpecificationOperation.Copy,
            baseFeatureId: `non-uuid-as-well`,
            selectSubSets: undefined as never,
          },
        ),
      ],
    }),
  );

  expect(errors).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        property: `scenarioId`,
        constraints: {
          isUuid: expect.anything(),
        },
      }),
      expect.objectContaining({
        property: `draft`,
        constraints: {
          isBoolean: expect.anything(),
        },
      }),
    ]),
  );

  const stratificationFeatureConfigError = errors.find(
    (error) => error.property === 'features',
  )?.children?.[0].children;
  expect(stratificationFeatureConfigError).toBeDefined();
  expect(stratificationFeatureConfigError).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        property: `baseFeatureId`,
        constraints: {
          isUuid: expect.anything(),
        },
      }),
      expect.objectContaining({
        property: `againstFeatureId`,
        constraints: {
          isDefined: expect.anything(),
          isUuid: expect.anything(),
        },
      }),
    ]),
  );

  const splitFeatureConfigError = errors.find(
    (error) => error.property === 'features',
  )?.children?.[1].children;
  expect(splitFeatureConfigError).toBeDefined();
  expect(splitFeatureConfigError).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        property: `baseFeatureId`,
        constraints: {
          isUuid: expect.anything(),
        },
      }),
      expect.objectContaining({
        property: `operation`,
        constraints: {
          equals: expect.anything(),
        },
      }),
    ]),
  );
});
