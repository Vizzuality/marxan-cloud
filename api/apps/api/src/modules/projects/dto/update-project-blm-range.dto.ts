import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { IsValidRange } from '@marxan-api/decorators/is-valid-range.decorator';

export class UpdateProjectBlmRangeDTO {
  @ApiProperty({ example: [0.001, 100] })
  @IsArray()
  @IsValidRange()
  range!: [number, number];
}
