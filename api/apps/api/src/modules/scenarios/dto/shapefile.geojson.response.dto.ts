import { ApiProperty } from '@nestjs/swagger';
import GeoJSON from 'geojson';

export class ShapefileGeoJSONResponseDTO {
  @ApiProperty()
  data!: GeoJSON.GeoJSON;
}
