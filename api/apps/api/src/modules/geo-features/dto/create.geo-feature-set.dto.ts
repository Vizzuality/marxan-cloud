import { SimpleJobStatus } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsUUID, ValidateNested } from 'class-validator';
import {
  GeoprocessingOp,
  GeoprocessingOpSplitV1,
  GeoprocessingOpStratificationV1,
} from '../types/geo-feature.geoprocessing-operations.type';
import { MarxanSettingsForGeoFeature } from '../types/geo-feature.marxan-settings.type';

export abstract class SpecForGeofeature {
  @IsUUID()
  @ApiProperty()
  featureId!: string;
}

export class SpecForPlainGeoFeature extends SpecForGeofeature {
  @ValidateNested()
  @ApiProperty()
  marxanSettings!: MarxanSettingsForGeoFeature;

  geoprocessingOperations?: never;
}

export class SpecForGeoFeatureWithGeoprocessing extends SpecForGeofeature {
  @IsUUID()
  @ApiProperty()
  featureId!: string;

  @ValidateNested({ each: true })
  @Type(() => GeoprocessingOp, {
    keepDiscriminatorProperty: true,
    discriminator: {
      property: 'kind',
      subTypes: [
        { value: GeoprocessingOpSplitV1, name: 'split/v1' },
        { value: GeoprocessingOpStratificationV1, name: 'stratification/v1' },
      ]
    }
  })
  @ApiPropertyOptional()
  geoprocessingOperations?: Array<
    GeoprocessingOpSplitV1 | GeoprocessingOpStratificationV1
  >;

  marxanSettings?: never;
}

export class CreateGeoFeatureSetDTO {
  @ApiProperty()
  @IsEnum(Object.keys(SimpleJobStatus))
  status!: SimpleJobStatus;

  @ApiProperty()
  @ValidateNested({ each: true })
  @Type(() => SpecForGeofeature, {
    discriminator: {
      property: 'kind',
      subTypes: [
        { value: SpecForPlainGeoFeature, name: 'plain' },
        { value: SpecForGeoFeatureWithGeoprocessing, name: 'withGeoprocessing' },
      ]
    }
  })
  features!: Array<SpecForPlainGeoFeature | SpecForGeoFeatureWithGeoprocessing>;
}
