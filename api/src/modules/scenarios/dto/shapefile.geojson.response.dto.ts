import { ApiProperty } from '@nestjs/swagger';
import { GeoJsonTypes } from 'geojson';

export class ShapefileGeoJSONResponseDTO {
  @ApiProperty()
  data!: GeoJsonTypes;
}
