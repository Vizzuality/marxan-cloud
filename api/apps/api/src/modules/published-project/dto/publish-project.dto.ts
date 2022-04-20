import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Company, Creator, Resource } from './create-published-project.dto';

export class PublishProjectDto {
  @IsString()
  @IsOptional()
  @ApiProperty()
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

  @IsOptional()
  @ApiPropertyOptional()
  company?: Company;
}
