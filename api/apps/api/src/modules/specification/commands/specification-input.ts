import {
  Equals,
  IsArray,
  IsBoolean,
  IsDefined,
  IsEnum,
  IsIn,
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
  @IsIn([SpecificationOperation.Split, SpecificationOperation.Copy])
  @IsDefined()
  operation!: SpecificationOperation.Split | SpecificationOperation.Copy;

  @IsUUID()
  @IsDefined()
  baseFeatureId!: string;
}

export class SpecificationFeatureStratification {
  @Equals(SpecificationOperation.Stratification)
  operation = SpecificationOperation.Stratification;

  @IsUUID()
  @IsDefined()
  baseFeatureId!: string;

  @IsUUID()
  @IsDefined()
  againstFeatureId!: string;
}
