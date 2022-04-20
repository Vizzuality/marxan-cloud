import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { Company, Creator, Resource } from './create-published-project.dto';

export class PublishProjectDto {
  @IsUUID()
  id!: string;

  @IsString()
  @ApiProperty()
  name!: string;

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
}
