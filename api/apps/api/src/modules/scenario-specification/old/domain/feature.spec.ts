import { FeatureTag } from '@marxan/features/domain';
import { Feature } from './feature';

describe(`when using stratification`, () => {
  describe(`out of bioregional feature`, () => {
    let feature: Feature<FeatureTag.Bioregional>;
    beforeEach(() => {
      feature = new Feature(
        'id',
        FeatureTag.Bioregional,
        [],
        `Terrestrial`,
        false,
      );
    });
    it(`should deny it`, () => {
      expect(() =>
        feature.stratification([]),
      ).toThrowErrorMatchingInlineSnapshot(
        `"Only Species features can be layered."`,
      );
    });
  });

  describe(`out of custom feature`, () => {
    let feature: Feature<FeatureTag.Species>;
    beforeEach(() => {
      feature = new Feature('id', FeatureTag.Species, [], `Terrestrial`, true);
    });
    it(`should deny it`, () => {
      expect(() =>
        feature.stratification([]),
      ).toThrowErrorMatchingInlineSnapshot(
        `"Custom features cannot be layered."`,
      );
    });
  });

  describe(`out of another bio-regional`, () => {
    let feature: Feature<FeatureTag.Species>;
    beforeEach(() => {
      feature = new Feature('id', FeatureTag.Species, [], `Lions`, false);
    });

    it(`should compose one`, () => {
      expect(
        feature.stratification(
          new Feature(
            `another-id`,
            FeatureTag.Bioregional,
            [],
            `Our Lions in savanna`,
            true,
          ),
        ),
      ).toMatchInlineSnapshot(`
        Array [
          ComputedFeature {
            "derivedFromFeatureId": "another-id",
            "id": "some-id-assigned-by-factory-stratification-single",
            "name": "Lions / Our Lions in savanna",
            "parentFeatureId": "id",
          },
        ]
      `);
    });
  });

  describe(`out of computed features`, () => {
    let feature: Feature<FeatureTag.Species>;
    beforeEach(() => {
      feature = new Feature('id', FeatureTag.Species, [], `Lions`, false);
    });

    it(`should combine them`, () => {
      expect(
        feature.stratification([
          {
            id: `computed-feature-1`,
            name: `grassland & savannas`,
            derivedFromFeatureId: `parent-1B`,
            parentFeatureId: `parent-1A`,
          },
          {
            id: `computed-feature-2`,
            name: `tropical`,
            derivedFromFeatureId: `parent-2B`,
            parentFeatureId: `parent-2A`,
          },
          {
            id: `computed-feature-3`,
            name: `deserts & shrubland`,
            derivedFromFeatureId: `parent-3B`,
            parentFeatureId: `parent-3A`,
          },
        ]),
      ).toMatchInlineSnapshot(`
        Array [
          ComputedFeature {
            "derivedFromFeatureId": "computed-feature-1",
            "id": "some-id-assigned-by-factory-stratification-multiple",
            "name": "Lions / grassland & savannas",
            "parentFeatureId": "id",
          },
          ComputedFeature {
            "derivedFromFeatureId": "computed-feature-2",
            "id": "some-id-assigned-by-factory-stratification-multiple",
            "name": "Lions / tropical",
            "parentFeatureId": "id",
          },
          ComputedFeature {
            "derivedFromFeatureId": "computed-feature-3",
            "id": "some-id-assigned-by-factory-stratification-multiple",
            "name": "Lions / deserts & shrubland",
            "parentFeatureId": "id",
          },
        ]
      `);
    });
  });
});

describe(`when using split`, () => {
  it('out of bioregional feature', () => {
    const feature = new Feature(
      'feature-id',
      FeatureTag.Bioregional,
      [
        {
          id: 'sub-id-1',
          key: `land`,
          value: `deserts & shrubland`,
        },
        {
          id: 'sub-id-2',
          key: `land`,
          value: `grassland & savannas`,
        },
        {
          id: 'sub-id-3',
          key: `land`,
          value: `tropical`,
        },
        {
          id: 'sub-id-4',
          key: `water`,
          value: `none`,
        },
        {
          id: 'sub-id-5',
          key: `water`,
          value: `plenty`,
        },
        {
          id: 'sub-id-6',
          key: `water`,
          value: `its an ocean`,
        },
      ],
      'terrestrial',
      false,
    );

    const splitOutcome = feature.split(`land`);

    expect(splitOutcome).toMatchInlineSnapshot(`
      Array [
        ComputedFeature {
          "derivedFromFeatureId": "sub-id-1",
          "id": "some-id-assigned-by-factory",
          "name": "deserts & shrubland",
          "parentFeatureId": "feature-id",
        },
        ComputedFeature {
          "derivedFromFeatureId": "sub-id-2",
          "id": "some-id-assigned-by-factory",
          "name": "grassland & savannas",
          "parentFeatureId": "feature-id",
        },
        ComputedFeature {
          "derivedFromFeatureId": "sub-id-3",
          "id": "some-id-assigned-by-factory",
          "name": "tropical",
          "parentFeatureId": "feature-id",
        },
      ]
    `);
  });
});
