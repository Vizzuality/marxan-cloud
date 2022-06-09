import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { SpecForPlainGeoFeature } from '../../../geo-features/dto/geo-feature-set-specification.dto';

export class LaunchLegacyProjectImportSpecificationDto {
  @ApiProperty()
  @ValidateNested({ each: true })
  @Type(() => SpecForPlainGeoFeature)
  features!: SpecForPlainGeoFeature[];
}
