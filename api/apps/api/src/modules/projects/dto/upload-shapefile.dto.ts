import { FeatureTag } from '@marxan/features';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UploadShapefileDTO {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsEnum(Object.values(FeatureTag))
  type!: FeatureTag;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
