import {
  Equals,
  IsArray,
  IsBoolean,
  IsDefined,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import {
  FeatureConfigCopy,
  FeatureConfigSplit,
  FeatureConfigStratification,
  SpecificationOperation,
} from '../domain';

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
  features!: (
    | SpecificationFeatureCopy
    | SpecificationFeatureSplit
    | SpecificationFeatureStratification
  )[];
}

export class SpecificationFeatureCopy implements FeatureConfigCopy {
  @Equals(SpecificationOperation.Copy)
  @IsDefined()
  operation: SpecificationOperation.Copy = SpecificationOperation.Copy;

  @IsUUID()
  @IsDefined()
  baseFeatureId!: string;

  selectSubSets!: never;

  @IsNumber()
  @IsOptional()
  target?: number;

  @IsNumber()
  @IsOptional()
  fpf?: number;

  @IsNumber()
  @IsOptional()
  prop?: number;
}

export class SpecificationFeatureSplit implements FeatureConfigSplit {
  @Equals(SpecificationOperation.Split)
  @IsDefined()
  operation: SpecificationOperation.Split = SpecificationOperation.Split;

  @IsUUID()
  @IsDefined()
  baseFeatureId!: string;

  @IsString()
  @IsDefined()
  splitByProperty!: string;

  @IsArray({ each: true })
  @IsOptional()
  selectSubSets?: FeatureSubSet[];

  @IsNumber()
  @IsOptional()
  target?: number;

  @IsNumber()
  @IsOptional()
  fpf?: number;

  @IsNumber()
  @IsOptional()
  prop?: number;
}

export class SpecificationFeatureStratification
  implements FeatureConfigStratification {
  @Equals(SpecificationOperation.Stratification)
  operation: SpecificationOperation.Stratification =
    SpecificationOperation.Stratification;

  @IsUUID()
  @IsDefined()
  baseFeatureId!: string;

  @IsUUID()
  @IsDefined()
  againstFeatureId!: string;

  @IsString()
  @IsOptional()
  splitByProperty?: string;

  @IsArray({ each: true })
  @IsOptional()
  selectSubSets?: FeatureSubSet[];

  @IsNumber()
  @IsOptional()
  target?: number;

  @IsNumber()
  @IsOptional()
  fpf?: number;

  @IsNumber()
  @IsOptional()
  prop?: number;
}

export class FeatureSubSet {
  @IsString()
  @IsDefined()
  value!: string;

  @IsNumber()
  @IsOptional()
  target?: number;

  @IsNumber()
  @IsOptional()
  fpf?: number;

  @IsNumber()
  @IsOptional()
  prop?: number;
}
