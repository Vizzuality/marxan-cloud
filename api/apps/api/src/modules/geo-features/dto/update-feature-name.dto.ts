import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateFeatureNameDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  featureClassName!: string;
}
