import { AggregateRoot } from '@nestjs/cqrs';

import { ComputeFeatureSpecificationEvent } from './events/compute-feature-specification.event';
import { FeatureSpecificationId } from './feature-specification.id';
import { FeatureSpecificationRevision } from './feature-specification-revision';
import { Feature } from './feature';

export enum SpecificationStatus {
  Draft = 'draft',
  Created = 'created',
}

export class SpecificationUpdate {
  features!: Feature[];
}

export class FeatureSpecification extends AggregateRoot {
  constructor(
    public readonly id: FeatureSpecificationId,
    private status: SpecificationStatus,
    private features: Feature[],
    private revision: FeatureSpecificationRevision = new FeatureSpecificationRevision(
      1,
    ),
  ) {
    super();
  }

  submit() {
    if (this.status !== SpecificationStatus.Draft) {
      this.revision = this.#nextRevision();
    }
    this.status = SpecificationStatus.Created;

    this.apply(new ComputeFeatureSpecificationEvent(this.id, this.revision));
  }

  async change(changeSet: SpecificationUpdate) {
    const errors = this.#validate(changeSet);

    if (errors.length > 0) {
      // return error
    }

    // TODO assign new values

    if (this.status === SpecificationStatus.Created) {
      this.revision = this.#nextRevision();
    }
    this.status = SpecificationStatus.Draft;
  }

  getRevision = () => this.revision?.value;
  getStatus = () => this.status;
  getFeatures = () => Object.freeze(this.features);

  #validate = (_changeSet: SpecificationUpdate): string[] => {
    return [];
  };

  #nextRevision = (): FeatureSpecificationRevision =>
    new FeatureSpecificationRevision(this.revision.value + 1);
}
