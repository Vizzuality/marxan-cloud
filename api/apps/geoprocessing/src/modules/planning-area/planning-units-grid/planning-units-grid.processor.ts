import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

import { ShapeType } from '@marxan-jobs/planning-unit-geometry';
import { ShapefileService } from '@marxan/shapefile-converter';
import { BBox, GeoJSON } from 'geojson';
import { v4 } from 'uuid';
import { SaveGeoJsonResult } from '@marxan/planning-area-repository';

@Injectable()
export class PlanningUnitsGridProcessor {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly shapefileService: ShapefileService,
  ) {}

  async save(
    shapefile: Express.Multer.File,
  ): Promise<
    {
      id: string;
      data: GeoJSON;
    } & SaveGeoJsonResult
  > {
    const { data: geoJson } = await this.shapefileService.transformToGeoJson(
      shapefile,
    );
    const fakeProjectId = v4();

    const { bbox } = await this.entityManager
      .transaction(async (manager) => {
        const u = await manager.query(
          `
            INSERT INTO "planning_units_geom"("the_geom", "type", "project_id")
            SELECT ST_SetSRID(
                     ST_GeomFromGeoJSON(features ->> 'geometry'),
                     4326)::geometry,
                   $2::shape_type,
                   $3
            FROM (
                   SELECT json_array_elements($1::json -> 'features') AS features
                 ) AS f
            ON CONFLICT (the_geom, type, COALESCE(project_id, '00000000-0000-0000-0000-000000000000')) DO UPDATE SET type = 'from_shapefile'::shape_type
            RETURNING "id", "project_id"
          `,
          [geoJson, ShapeType.FromShapefile, fakeProjectId],
        );

        console.log(u);
        console.log(fakeProjectId);

        const planningArea: {
          id: string;
          bbox: BBox;
        }[] = await manager.query(
          `
            INSERT
            INTO "planning_areas"("id", "project_id", "the_geom")
            VALUES ($1, $1,
                    (SELECT ST_MULTI(ST_UNION(the_geom))
                     from "planning_units_geom"
                     where project_id = $1))
            RETURNING "id", "bbox"
          `,
          [fakeProjectId],
        );

        return {
          planningAreaId: planningArea[0]?.id,
          bbox: planningArea[0]!.bbox,
        };
      })
      .catch((error) => {
        this.logger.error(error);
        throw error;
      });

    return {
      id: fakeProjectId,
      data: geoJson,
      minPuAreaSize: 0,
      maxPuAreaSize: 0,
      bbox,
    };
  }
}
