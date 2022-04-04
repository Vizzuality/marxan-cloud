import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { IsValidRange } from '@marxan-api/decorators/is-valid-range.decorator';
import { WebshotConfig } from '@marxan/webshot';
import { Type } from 'class-transformer';

export class StartScenarioBlmCalibrationDto {
  @ApiProperty({ example: [0.001, 100], required: false })
  @IsOptional()
  @IsArray()
  @IsValidRange()
  range?: [number, number];

  @ApiProperty()
  @ValidateNested({ each: true })
  @Type(() => WebshotConfig)
  config!: WebshotConfig;
}
