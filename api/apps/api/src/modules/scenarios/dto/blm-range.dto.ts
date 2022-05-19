import { ApiProperty } from '@nestjs/swagger';
import { defaultBlmRange } from '../../projects/blm/domain/blm-values-calculator';

export class BlmRangeDto {
  @ApiProperty({
    description: 'Range used to calculate values',
    example: defaultBlmRange,
    isArray: true,
  })
  range!: [number, number];

  static fromBlmValues(blmRange: [number, number]): BlmRangeDto {
    return { range: blmRange };
  }
}
