import { WebshotConfig } from '@marxan/webshot';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
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
  location?: string;

  @IsOptional()
  @ApiPropertyOptional()
  creators?: Creator[];

  @IsOptional()
  @ApiPropertyOptional()
  resources?: Resource[];

  @IsOptional()
  @ApiPropertyOptional()
  company?: Company;

  @IsOptional()
  @ApiPropertyOptional()
  featuredScenarioId?: string;
}

export class CreatePublishProjectDto extends PublishProjectDto {
  @ApiProperty()
  @ValidateNested({ each: true })
  @Type(() => WebshotConfig)
  config!: WebshotConfig;
}
