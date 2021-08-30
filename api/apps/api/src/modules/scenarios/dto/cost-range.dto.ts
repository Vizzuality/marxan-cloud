import { ApiProperty } from '@nestjs/swagger';

export class CostRangeDto {
  @ApiProperty()
  min!: number;

  @ApiProperty()
  max!: number;
}
