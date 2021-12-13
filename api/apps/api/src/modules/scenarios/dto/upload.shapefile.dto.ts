import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UploadShapefileDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;
}
