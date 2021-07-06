import { Type } from 'class-transformer';
import { IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { SpecForGeofeature } from '../dto/create.geo-feature-set.dto';
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
