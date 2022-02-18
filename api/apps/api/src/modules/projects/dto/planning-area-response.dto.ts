import { ApiProperty } from '@nestjs/swagger';
import { GeoJSON } from 'geojson';
import { GeoJsonDataDTO } from '../../scenarios/dto/shapefile.geojson.response.dto';

export class PlanningAreaResponseDto extends GeoJsonDataDTO {
  @ApiProperty({
    description: 'An ID of the created planning area',
  })
  id!: string;

  @ApiProperty({
    description: 'GeoJSON of the created planning area',
  })
  data!: GeoJSON;
}
