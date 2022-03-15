import { ApiProperty } from '@nestjs/swagger';
import GeoJSON from 'geojson';

export class GeoJsonDataDTO {
  @ApiProperty()
  data!: GeoJSON.GeoJSON;
}
