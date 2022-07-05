import { Injectable } from '@nestjs/common';
import { SingleSplitConfigFeatureValue } from './single-config-feature-value';

@Injectable()
export class StripSingleSplitConfigFeatureValue {
  execute({ subset, ...input }: SingleSplitConfigFeatureValue) {
    const stripped = {
      operation: input.operation,
      splitByProperty: input.splitByProperty,
      baseFeatureId: input.baseFeatureId,
      value: subset ? subset.value : undefined,
    };

    return stripped;
  }
}
