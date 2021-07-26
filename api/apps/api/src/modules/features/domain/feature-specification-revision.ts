import {
  ensure,
  isDefined,
  isInteger,
  TinyType,
  isGreaterThanOrEqualTo,
} from 'tiny-types';

export class FeatureSpecificationRevision extends TinyType {
  constructor(public readonly value: number) {
    super();
    ensure(
      'FeatureSpecificationRevision',
      value,
      isDefined(),
      isInteger(),
      isGreaterThanOrEqualTo(1),
    );
  }
}
