import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProjectGridRequestDto {
  @ApiProperty()
  @IsString()
  id!: string;
}
