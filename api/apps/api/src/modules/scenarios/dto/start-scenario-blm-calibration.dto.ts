import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional } from 'class-validator';
import { IsValidRange } from '@marxan-api/decorators/is-valid-range.decorator';

export class StartScenarioBlmCalibrationDto {
  @ApiProperty({ example: [0.001, 100], required: false })
  @IsOptional()
  @IsArray()
  @IsValidRange()
  range?: [number, number];
}
