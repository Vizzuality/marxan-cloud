import { FeatureConfigSplit } from '@marxan-api/modules/specification';
import { SingleSplitConfigFeatureValue } from '@marxan/features-hash';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SplitFeatureConfigMapper {
  toSingleSplitFeatureConfig(
    input: FeatureConfigSplit,
  ): SingleSplitConfigFeatureValue[] {
    const subsets = input.selectSubSets;
    return subsets
      ? subsets.map<SingleSplitConfigFeatureValue>((subset) => ({
          baseFeatureId: input.baseFeatureId,
          operation: input.operation,
          splitByProperty: input.splitByProperty,
          subset,
        }))
      : [
          {
            baseFeatureId: input.baseFeatureId,
            operation: input.operation,
            splitByProperty: input.splitByProperty,
          },
        ];
  }
}
