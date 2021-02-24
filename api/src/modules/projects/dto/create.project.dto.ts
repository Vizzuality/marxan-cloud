import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsAlpha,
  IsOptional,
  IsUppercase,
  IsUUID,
  Length,
} from 'class-validator';
import { Dictionary } from 'lodash';

export class CreateProjectDTO {
  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  @IsUUID()
  organizationId: string;

  @ApiPropertyOptional({
    description: 'ISO 3166-1 alpha3 country code (uppercase)',
    example: 'ESP',
  })
  @IsAlpha()
  @IsUppercase()
  @Length(3, 3)
  @IsOptional()
  countryId?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  adminRegionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  extent?: Record<string, unknown>;

  @ApiPropertyOptional()
  metadata?: Dictionary<string>;
}
