import { ApiProperty } from '@nestjs/swagger';
import { GeoJSON } from 'geojson';

export class PlanningAreaDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  data!: GeoJSON;
}
