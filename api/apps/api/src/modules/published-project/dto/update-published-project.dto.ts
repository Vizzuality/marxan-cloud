import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Company, Creator, Resource } from './create-published-project.dto';

export class UpdatePublishedProjectDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  name?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  description?: string;

  @IsOptional()
  @ApiPropertyOptional()
  creators?: Creator[];

  @IsOptional()
  @ApiPropertyOptional()
  resources?: Resource[];

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  company?: Company;

  @IsBoolean()
  @IsOptional()
  underModeration?: boolean;
}
