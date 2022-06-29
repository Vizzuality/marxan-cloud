import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { IsValidRange } from '@marxan-api/decorators/is-valid-range.decorator';
import { defaultBlmRange } from '@marxan-api/modules/projects/blm/domain/blm-values-calculator';

export class UpdateProjectBlmRangeDTO {
  @ApiProperty({ example: defaultBlmRange })
  @IsArray()
  @IsValidRange()
  range!: [number, number];
}
