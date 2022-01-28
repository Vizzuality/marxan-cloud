import { ApiProperty } from '@nestjs/swagger';

export class BlmRangeDto {
  @ApiProperty({
    description: 'Range used to calculate values',
    example: [0.001, 100],
    isArray: true,
  })
  range!: [number, number];

  static fromBlmValues(blmRange: [number, number]): BlmRangeDto {
    return { range: blmRange };
  }
}
