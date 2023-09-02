import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateProtectedAreaNameDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;
}
