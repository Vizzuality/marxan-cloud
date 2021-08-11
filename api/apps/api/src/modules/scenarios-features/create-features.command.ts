import { Command } from '@nestjs-architects/typed-cqrs';
import { SpecificationOperation } from '@marxan-api/modules/specification/domain';

interface FeatureConfigBase {
  operation: SpecificationOperation;
  baseFeatureId: string;
  againstFeatureId?: string;
}

export interface FeatureConfigStratification extends FeatureConfigBase {
  operation: SpecificationOperation.Stratification;
  againstFeatureId: string;
}

export interface FeatureConfigDefault extends FeatureConfigBase {
  operation: SpecificationOperation.Copy | SpecificationOperation.Split;
}

export type FeatureConfigInput =
  | FeatureConfigStratification
  | FeatureConfigDefault;

export class CreateFeaturesCommand extends Command<void> {
  constructor(
    public readonly scenarioId: string,
    public readonly input: FeatureConfigInput,
  ) {
    super();
  }
}
