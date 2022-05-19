import { IsValidRange } from '@marxan-api/decorators/is-valid-range.decorator';
import { WebshotConfig } from '@marxan/webshot';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { defaultBlmRange } from '../../projects/blm/domain/blm-values-calculator';

export class StartScenarioBlmCalibrationDto {
  @ApiProperty({ example: defaultBlmRange, required: false })
  @IsOptional()
  @IsArray()
  @IsValidRange()
  range?: [number, number];

  @ApiProperty()
  @ValidateNested({ each: true })
  @Type(() => WebshotConfig)
  config!: WebshotConfig;
}
