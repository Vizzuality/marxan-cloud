import { v4 } from 'uuid';
import { validateSync } from 'class-validator';
import { plainToClass } from 'class-transformer';
import {
  SpecificationFeature,
  SpecificationFeatureStratification,
  SpecificationInput,
} from './specification-input';
import { SpecificationOperation } from '../feature-config';

test(`valid values`, () => {
  const errors = validateSync(
    plainToClass<SpecificationInput, SpecificationInput>(SpecificationInput, {
      scenarioId: v4(),
      draft: true,
      features: [
        plainToClass<
          SpecificationFeatureStratification,
          SpecificationFeatureStratification
        >(SpecificationFeatureStratification, {
          operation: SpecificationOperation.Stratification,
          baseFeatureId: v4(),
          againstFeatureId: v4(),
        }),
        plainToClass<SpecificationFeature, SpecificationFeature>(
          SpecificationFeature,
          {
            operation: SpecificationOperation.Split,
            baseFeatureId: v4(),
          },
        ),
        plainToClass<SpecificationFeature, SpecificationFeature>(
          SpecificationFeature,
          {
            operation: SpecificationOperation.Copy,
            baseFeatureId: v4(),
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
      draft: (`true` as unknown) as boolean,
      features: [
        plainToClass<
          SpecificationFeatureStratification,
          SpecificationFeatureStratification
        >(SpecificationFeatureStratification, {
          operation: SpecificationOperation.Stratification,
          baseFeatureId: `non-uuid-as-well`,
          againstFeatureId: (undefined as unknown) as string,
        }),
        plainToClass<SpecificationFeature, SpecificationFeature>(
          SpecificationFeature,
          {
            operation: (`invalid operation` as unknown) as SpecificationOperation.Copy,
            baseFeatureId: `non-uuid-as-well`,
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
  )?.children[0].children;
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
  )?.children[1].children;
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
          isIn: expect.anything(),
        },
      }),
    ]),
  );
});
