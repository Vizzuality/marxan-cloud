import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { Dictionary } from 'lodash';

export class CreateProjectDTO {
  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  @IsUUID()
  organizationId: string;

  @ApiPropertyOptional()
  @IsString()
  @Length(3)
  @IsOptional()
  country?: string;

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
