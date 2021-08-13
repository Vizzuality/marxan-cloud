import { Test } from '@nestjs/testing';
import { plainToClass } from 'class-transformer';
import {
  SpecForGeoFeatureWithGeoprocessing,
  SpecForPlainGeoFeature,
} from '@marxan-api/modules/geo-features/dto/geo-feature-set-specification.dto';
import { MarxanSettingsForGeoFeature } from '@marxan-api/modules/geo-features/types/geo-feature.marxan-settings.type';

import { GeoFeatureDtoMapper } from './geo-feature-dto.mapper';
import { GeoprocessingOpStratificationV1 } from '@marxan-api/modules/geo-features/types/geo-feature.geoprocessing-operations.type';

let sut: GeoFeatureDtoMapper;

test(`split configuration`, () => {
  const featureId = `5f594cca-89e6-40cf-bdaf-8d89646a8c8b`;
  const intersectWithFeatureId = `438cce22-dbc7-46d5-8f28-83b340aadad5`;
  const marxanSettings = plainToClass<
    MarxanSettingsForGeoFeature,
    MarxanSettingsForGeoFeature
  >(MarxanSettingsForGeoFeature, {
    target: 20,
    fpf: 1,
    prop: 0.5,
  });
  const output = sut.toFeatureConfig(
    plainToClass<
      SpecForGeoFeatureWithGeoprocessing,
      SpecForGeoFeatureWithGeoprocessing
    >(SpecForGeoFeatureWithGeoprocessing, {
      featureId,
      geoprocessingOperations: [
        plainToClass<
          GeoprocessingOpStratificationV1,
          GeoprocessingOpStratificationV1
        >(GeoprocessingOpStratificationV1, {
          kind: 'stratification/v1',
          intersectWith: {
            featureId: intersectWithFeatureId,
          },
          splitByProperty: `split-property`,
          splits: [
            {
              value: `savanna`,
              marxanSettings,
            },
            {
              value: `tropical`,
              marxanSettings,
            },
          ],
        }),
      ],
    }),
  );

  expect(output).toMatchInlineSnapshot(`
    Array [
      SpecificationFeatureStratification {
        "againstFeatureId": "438cce22-dbc7-46d5-8f28-83b340aadad5",
        "baseFeatureId": "5f594cca-89e6-40cf-bdaf-8d89646a8c8b",
        "operation": "stratification",
        "selectSubSets": Array [
          FeatureSubSet {
            "fpf": 1,
            "prop": 0.5,
            "target": 20,
            "value": "savanna",
          },
          FeatureSubSet {
            "fpf": 1,
            "prop": 0.5,
            "target": 20,
            "value": "tropical",
          },
        ],
        "splitByProperty": "split-property",
      },
    ]
  `);
});

test(`copy configuration`, () => {
  const featureId = `5f594cca-89e6-40cf-bdaf-8d89646a8c8b`;
  const output = sut.toFeatureConfig(
    plainToClass<SpecForPlainGeoFeature, SpecForPlainGeoFeature>(
      SpecForPlainGeoFeature,
      {
        kind: `plain`,
        featureId,
        marxanSettings: plainToClass<
          MarxanSettingsForGeoFeature,
          MarxanSettingsForGeoFeature
        >(MarxanSettingsForGeoFeature, {
          target: 20,
          fpf: 1,
          prop: 0.5,
        }),
      },
    ),
  );
  expect(output).toMatchInlineSnapshot(`
    Array [
      SpecificationFeatureCopy {
        "baseFeatureId": "5f594cca-89e6-40cf-bdaf-8d89646a8c8b",
        "fpf": 1,
        "operation": "copy",
        "prop": 0.5,
        "selectSubSets": undefined,
        "target": 20,
      },
    ]
  `);
});

beforeEach(async () => {
  const sandbox = await Test.createTestingModule({
    providers: [GeoFeatureDtoMapper],
  }).compile();

  sut = sandbox.get(GeoFeatureDtoMapper);
});
