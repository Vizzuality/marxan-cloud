import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateFeatureNameDto {
  @ApiProperty()
  @IsString()
  featureClassName!: string;
}
