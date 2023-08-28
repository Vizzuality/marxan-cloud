import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadCostSurfaceShapefileDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;
}
