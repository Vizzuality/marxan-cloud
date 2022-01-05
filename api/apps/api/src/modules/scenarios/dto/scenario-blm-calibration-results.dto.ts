import { ApiProperty } from '@nestjs/swagger';

export class BlmCalibrationRunResultDto {
  @ApiProperty({ example: '4f9a83f3-c375-4786-a406-156a6b6592fd' })
  id!: string;

  @ApiProperty({ example: 'ab413cd5-fdc7-429c-a11d-ceb5645466e5' })
  scenarioId!: string;

  @ApiProperty({ example: 3133.35 })
  blmValue!: number;

  @ApiProperty({ example: 12345 })
  cost!: number;

  @ApiProperty({ example: 12345 })
  boundaryLength!: number;
}
