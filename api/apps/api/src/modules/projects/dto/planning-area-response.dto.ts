import { ApiProperty } from '@nestjs/swagger';
import { GeoJSON } from 'geojson';
import { ShapefileGeoJSONResponseDTO } from '../../scenarios/dto/shapefile.geojson.response.dto';

export class PlanningAreaResponseDto extends ShapefileGeoJSONResponseDTO {
  @ApiProperty({
    description: 'An ID of the created planning area',
  })
  id!: string;

  @ApiProperty({
    description: 'GeoJSON of the created planning area',
  })
  data!: GeoJSON;
}
