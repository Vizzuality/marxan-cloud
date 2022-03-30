import { ProjectsPuEntity } from '@marxan-jobs/planning-unit-geometry';
import { SaveGeoJsonResult } from '@marxan/planning-area-repository';
import { PlanningUnitGridShape } from '@marxan/scenarios-planning-unit';
import { ShapefileService } from '@marxan/shapefile-converter';
import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { BBox, GeoJSON } from 'geojson';
import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';
import { PlanningAreaGarbageCollector } from '../planning-area-garbage-collector.service';

@Injectable()
export class PlanningUnitsGridProcessor {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly shapefileService: ShapefileService,
    private readonly paGarbageCollector: PlanningAreaGarbageCollector,
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
    const planningAreaId = v4();

    const { bbox } = await this.entityManager
      .transaction(async (manager) => {
        const geometries: { id: string }[] = await manager.query(
          `
            INSERT INTO "planning_units_geom"("the_geom", "type")
            SELECT
              ST_SetSRID(ST_GeomFromGeoJSON(features ->> 'geometry'), 4326)::geometry,
              $2::planning_unit_grid_shape
            FROM (SELECT json_array_elements($1::json -> 'features') AS features) AS f
            ON CONFLICT (the_geom_hash, type) DO UPDATE SET type = $2::planning_unit_grid_shape
            RETURNING "id"
          `,
          [geoJson, PlanningUnitGridShape.FromShapefile],
        );

        const geometryIds = geometries.map((geom) => geom.id);
        const projectsPuRepo = manager.getRepository(ProjectsPuEntity);
        await projectsPuRepo.save(
          geometryIds.map((id, index) => ({
            geomId: id,
            geomType: PlanningUnitGridShape.FromShapefile,
            puid: index + 1,
            planningAreaId: planningAreaId,
          })),
        );

        const [planningArea]: [
          {
            id: string;
            bbox: BBox;
          },
        ] = await manager.query(
          `
            INSERT INTO "planning_areas"("id", "project_id", "the_geom")
            VALUES ($1, $1,
                    (SELECT ST_MULTI(ST_UNION(the_geom))
                     FROM "planning_units_geom" pug
                      INNER JOIN "projects_pu" ppu on pug.id = ppu.geom_id
                     WHERE ppu.planning_area_id = $1))
            RETURNING "id", "bbox"
          `,
          [planningAreaId],
        );

        return {
          planningAreaId: planningArea?.id,
          bbox: planningArea?.bbox,
        };
      })
      .catch((error) => {
        this.logger.error(error);
        throw error;
      });

    await this.paGarbageCollector.collectGarbage();

    return {
      id: planningAreaId,
      data: geoJson,
      minPuAreaSize: 0,
      maxPuAreaSize: 0,
      bbox,
    };
  }
}
