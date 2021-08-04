import {
  IsArray,
  IsBoolean,
  IsDefined,
  IsEnum,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { SpecificationOperation } from '../feature-config';

export class SpecificationInput {
  @IsUUID()
  @IsDefined()
  scenarioId!: string;

  @IsBoolean()
  @IsDefined()
  draft!: boolean;

  @IsDefined()
  @IsArray()
  @ValidateNested()
  features!: (SpecificationFeature | SpecificationFeatureStratification)[];
}

export class SpecificationFeature {
  @IsEnum(SpecificationOperation)
  @IsDefined()
  operation!: SpecificationOperation.Split | SpecificationOperation.Copy;

  @IsUUID()
  @IsDefined()
  baseFeatureId!: string;
}

export class SpecificationFeatureStratification {
  operation = SpecificationOperation.Stratification;

  @IsUUID()
  @IsDefined()
  baseFeatureId!: string;

  @IsUUID()
  @IsDefined()
  againstFeatureId!: string;
}
