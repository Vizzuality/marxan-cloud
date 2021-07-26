import {
  FeatureSpecification,
  SpecificationStatus,
} from './feature-specification';
import { FeatureSpecificationId } from './feature-specification.id';
import { FeatureSpecificationRevision } from './feature-specification-revision';

describe(`when specification was already created`, () => {
  let spec: FeatureSpecification;
  beforeEach(() => {
    spec = new FeatureSpecification(
      new FeatureSpecificationId(`spec-id`),
      SpecificationStatus.Created,
      [],
      new FeatureSpecificationRevision(5),
    );
  });

  describe(`when submitting again`, () => {
    beforeEach(() => {
      spec.submit();
    });

    it(`should emit compute event`, () => {
      expect(spec.getUncommittedEvents()).toMatchInlineSnapshot(`
        Array [
          ComputeFeatureSpecificationEvent {
            "featureSpecificationId": "spec-id",
            "revision": 6,
          },
        ]
      `);
    });

    it(`should change state`, () => {
      expect(spec.getStatus()).toEqual(SpecificationStatus.Created);
    });
    it(`should set revision to 6`, () => {
      expect(spec.getRevision()).toEqual(6);
    });
  });

  describe(`when changing spec`, () => {
    beforeEach(() => {
      spec.change({
        features: [],
      });
    });

    it(`should not emit compute event`, () => {
      expect(spec.getUncommittedEvents()).toEqual([]);
    });
    it(`should put into draft state`, () => {
      expect(spec.getStatus()).toEqual(SpecificationStatus.Draft);
    });
    it(`should generate new revision number`, () => {
      expect(spec.getRevision()).toEqual(6);
    });
  });
});

describe(`when creating brand new specification`, () => {
  let spec: FeatureSpecification;
  beforeEach(() => {
    spec = new FeatureSpecification(
      new FeatureSpecificationId(`spec-id`),
      SpecificationStatus.Draft,
      [],
    );
  });

  describe(`when submitting`, () => {
    beforeEach(() => {
      spec.submit();
    });
    it(`should emit compute event`, () => {
      expect(spec.getUncommittedEvents()).toMatchInlineSnapshot(`
        Array [
          ComputeFeatureSpecificationEvent {
            "featureSpecificationId": "spec-id",
            "revision": 1,
          },
        ]
      `);
    });
    it(`should change state`, () => {
      expect(spec.getStatus()).toEqual(SpecificationStatus.Created);
    });
    it(`should set revision to 1`, () => {
      expect(spec.getRevision()).toEqual(1);
    });
  });

  describe(`when changing configuration`, () => {
    beforeEach(() => {
      spec.change({
        features: [],
      });
    });
    it(`should not emit compute event`, () => {
      expect(spec.getUncommittedEvents()).toEqual([]);
    });
    it(`should keep draft state`, () => {
      expect(spec.getStatus()).toEqual(SpecificationStatus.Draft);
    });
    it(`should assign revision number`, () => {
      expect(spec.getRevision()).toEqual(1);
    });
  });
});
