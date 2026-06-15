import { Type } from 'class-transformer';
import {
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { SpecForGeofeature } from '../dto/geo-feature-set-specification.dto';
import { MarxanSettingsForGeoFeature } from './geo-feature.marxan-settings.type';

export abstract class GeoprocessingOp {
  kind!: 'split/v1' | 'stratification/v1';
}

class SplitV1Settings {
  @IsString()
  value!: string;

  @ValidateNested()
  @Type(() => MarxanSettingsForGeoFeature)
  marxanSettings!: MarxanSettingsForGeoFeature;

  /**
   * Real id of the materialized child feature for this split value. Set by the
   * backend on the read path (`extendGeoFeatureProcessingSpecification`) once
   * the split has materialized; optional and ignored on write. Whitelisted here
   * so the specification survives `forbidNonWhitelisted` when the frontend
   * round-trips it back on save.
   */
  @IsOptional()
  @IsUUID()
  featureId?: string;

  @IsOptional()
  @IsObject()
  amountRange?: { min: number; max: number };

  @IsOptional()
  @IsString()
  creationStatus?: string;
}

export class GeoprocessingOpSplitV1 extends GeoprocessingOp {
  @IsString()
  kind!: 'split/v1';

  @IsString()
  splitByProperty!: string;

  @ValidateNested({ each: true })
  @Type(() => SplitV1Settings)
  splits!: SplitV1Settings[];
}

export class GeoprocessingOpStratificationV1 extends GeoprocessingOp {
  @IsString()
  kind!: 'stratification/v1';

  @IsObject()
  @Type(() => SpecForGeofeature)
  intersectWith!: SpecForGeofeature;

  @IsOptional()
  @IsString()
  splitByProperty?: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SplitV1Settings)
  splits?: SplitV1Settings[];
}
