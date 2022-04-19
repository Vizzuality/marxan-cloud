import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';
import { Creator, Resource } from './create-published-project.dto';

export class PublishProjectDto {
  @IsUUID()
  id!: string;

  @IsString()
  @ApiProperty()
  name!: string;

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
}
