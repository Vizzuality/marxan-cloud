import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCostSurfaceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;
}
