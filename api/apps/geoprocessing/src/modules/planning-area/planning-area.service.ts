import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { GeoJSON } from 'geojson';
import { InjectRepository } from '@nestjs/typeorm';
import { PlanningArea } from './planning-area.geo.entity';
import { ShapefileService } from '@marxan-geoprocessing/modules/shapefiles/shapefiles.service';

@Injectable()
export class PlanningAreaService {
  constructor(
    @InjectRepository(PlanningArea)
    private readonly planningAreas: Repository<PlanningArea>,
    private readonly shapefileService: ShapefileService,
  ) {}

  async save(
    shapefile: Express.Multer.File,
  ): Promise<{ data: GeoJSON; id: string }> {
    const { data } = await this.shapefileService.transformToGeoJson(shapefile);
    const result = await this.planningAreas.query(
      `
INSERT INTO "planning_area"("the_geom")
  SELECT ST_SetSRID(
    ST_Collect(
      ST_GeomFromGeoJSON(features->>'geometry')
    ), 4326)::geometry
  FROM (
    SELECT json_array_elements($1::json->'features') AS features
  ) AS f RETURNING "id";
    `,
      [data],
    );
    return {
      id: result[0].id,
      data,
    };
  }
}
