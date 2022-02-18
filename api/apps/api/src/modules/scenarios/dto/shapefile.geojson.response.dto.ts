import { ApiProperty } from '@nestjs/swagger';
import GeoJSON, { FeatureCollection } from 'geojson';

export class GeoJsonDataDTO {
  @ApiProperty()
  data!: GeoJSON.GeoJSON;
}
