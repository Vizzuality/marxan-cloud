import { ApiProperty } from '@nestjs/swagger';
import { GeoJSON } from 'geojson';

export class PlanningAreaCreatedDto {
  @ApiProperty({
    description: 'An ID of the created planning area',
  })
  id!: string;

  @ApiProperty({
    description: 'GeoJSON of the created planning area',
  })
  data!: GeoJSON;
}
