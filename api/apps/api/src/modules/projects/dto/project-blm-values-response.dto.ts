import { ApiProperty } from '@nestjs/swagger';

export class ProjectBlmValuesResponseDto {
  @ApiProperty({
    description: 'An ID of the project that owns this BLM values',
    example: '6fbec34e-04a7-4131-be14-c245f2435a6c',
  })
  id!: string;

  @ApiProperty({
    description: 'Range used to calculate values',
    example: [0.001, 100],
    isArray: true,
  })
  range!: [number, number];

  @ApiProperty({
    description: 'Default BLM values',
    example: [
      0.03872983346207417, 606.799665767047, 1213.5606017006319,
      1820.3215376342168, 2427.0824735678016, 3033.8434095013868,
    ],
    isArray: true,
  })
  defaults!: number[];

  @ApiProperty({
    description:
      'Calculated BLM values according to given range and planning unit area',
    example: [
      38.72983346207417, 316.2936399402723, 593.8574464184705,
      871.4212528966688, 1148.985059374867, 1426.548865853065,
    ],
    isArray: true,
  })
  values!: number[];
}
