import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';
import { Creator, Resource } from './create-published-project.dto';

export class UpdatePublishedProjectDto {
  @IsString()
  @ApiProperty()
  name?: string;

  @IsString()
  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  creators?: Creator[];

  @ApiPropertyOptional()
  resources?: Resource[];

  @IsString()
  @ApiPropertyOptional()
  logo?: string;

  @IsBoolean()
  underModeration?: boolean;
}
