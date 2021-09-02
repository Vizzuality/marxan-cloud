import { SimpleJobStatus } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  Equals,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { GeoFeature } from '../geo-feature.api.entity';
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
  @Equals('plain')
  kind!: 'plain';

  @ValidateNested()
  @Type(() => MarxanSettingsForGeoFeature)
  @ApiProperty()
  marxanSettings!: MarxanSettingsForGeoFeature;

  geoprocessingOperations?: never;
}

export class SpecForPlainGeoFeatureWithFeatureMetadata extends SpecForPlainGeoFeature {
  @ApiProperty()
  metadata!: GeoFeature;
}

export class SpecForGeoFeatureWithGeoprocessing extends SpecForGeofeature {
  @Equals('withGeoprocessing')
  kind!: 'withGeoprocessing';

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
      ],
    },
  })
  @ApiPropertyOptional()
  geoprocessingOperations?: Array<
    GeoprocessingOpSplitV1 | GeoprocessingOpStratificationV1
  >;

  marxanSettings?: never;
}

export class SpecForGeoFeatureWithGeoprocessingWithFeatureMetadata extends SpecForPlainGeoFeature {
  @ApiProperty()
  metadata!: GeoFeature;
}

export class GeoFeatureSetSpecification {
  @ApiProperty()
  // @IsEnum(Object.keys(SimpleJobStatus))
  @IsEnum(['draft', 'created'])
  status!: SimpleJobStatus;

  @ApiProperty()
  @ValidateNested({ each: true })
  @Type(() => SpecForGeofeature, {
    keepDiscriminatorProperty: true,
    discriminator: {
      property: 'kind',
      subTypes: [
        { value: SpecForPlainGeoFeature, name: 'plain' },
        {
          value: SpecForGeoFeatureWithGeoprocessing,
          name: 'withGeoprocessing',
        },
      ],
    },
  })
  features!: Array<SpecForPlainGeoFeature | SpecForGeoFeatureWithGeoprocessing>;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  doNotCalculateAreas?: boolean;
}
