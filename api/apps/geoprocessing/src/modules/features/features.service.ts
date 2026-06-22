import { Injectable, Logger } from '@nestjs/common';
import { TileService } from '@marxan-geoprocessing/modules/tile/tile.service';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { GeoFeatureGeometry } from '@marxan/geofeatures';
import { IsArray, IsNumber, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { BBox } from 'geojson';
import { antimeridianBbox, nominatim2bbox } from '@marxan/utils/geo';

import { TileRequest } from '@marxan/tiles';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';

export class TileSpecification extends TileRequest {
  @ApiProperty()
  @IsString()
  id!: string;
}

/**
 * @todo add validation for bbox
 */
export class FeaturesFilters {
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Transform((value: string): BBox => JSON.parse(value))
  bbox?: BBox;
}

@Injectable()
export class FeatureService {
  private readonly logger: Logger = new Logger(FeatureService.name);

  constructor(
    @InjectRepository(GeoFeatureGeometry)
    private readonly featuresRepository: Repository<GeoFeatureGeometry>,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly apiEntityManager: EntityManager,
    private readonly tileService: TileService,
  ) {}

  /**
   *
   * @todo generate the custom queries using query builder and the entity data.
   * @todo move the string to int transformation to the AdminAreaLevelFilters class
   */

  async buildFeaturesWhereQuery(
    id: string,
    forProject: boolean,
    bbox?: BBox,
  ): Promise<{ where: string; parameters?: Record<string, unknown> }> {
    /**
     * Materialized split features own no `features_data` rows of their own:
     * their geometries are a subset of the *parent* feature's rows, linked via
     * the stable ids stored in `(apidb)features.feature_data_stable_ids`. On the
     * geometry path (`forProject === false`, reading from `features_data`) we
     * must therefore select rows by `stable_id`, since the split feature's own
     * `feature_id` matches no rows.
     *
     * On the project path (`forProject === true`) tiles are rendered from
     * `feature_amounts_per_planning_unit`, where amounts are already
     * materialized per feature id (including for split features); that table has
     * no `stable_id` column, so we keep filtering by `feature_id` and skip the
     * stable-id lookup entirely.
     */
    const featureDataStableIds: Array<string> | null = forProject
      ? null
      : await this.apiEntityManager
          .createQueryBuilder()
          .select('feature_data_stable_ids')
          .from('features', 'f')
          .where('id = :id', { id })
          .execute()
          .then((result) => result?.[0]?.feature_data_stable_ids ?? null);

    /**
     * Bind the stable ids as a single array parameter rather than inlining them
     * as SQL literals. A split of a large/global parent can carry tens of
     * thousands of ids (≈59k seen in production); inlining them builds multi-MB
     * of SQL text that is re-parsed on every `{z}/{x}/{y}` tile request. As a
     * bound parameter the SQL text stays tiny and the plan is cached [MRXNM-97].
     */
    let whereQuery: string;
    let parameters: Record<string, unknown> | undefined;
    if (featureDataStableIds && featureDataStableIds.length > 0) {
      whereQuery = `stable_id = ANY(:splitFeatureStableIds::uuid[])`;
      parameters = { splitFeatureStableIds: featureDataStableIds };
    } else {
      whereQuery = `feature_id = '${id}'`;
    }

    if (bbox) {
      const { westBbox, eastBbox } = antimeridianBbox(nominatim2bbox(bbox));
      whereQuery += ` AND
      (st_intersects(
        st_intersection(st_makeenvelope(${eastBbox}, 4326),
        ST_MakeEnvelope(0, -90, 180, 90, 4326)),
      the_geom
      ) or st_intersects(
      st_intersection(st_makeenvelope(${westBbox}, 4326),
      ST_MakeEnvelope(-180, -90, 0, 90, 4326)),
      the_geom
      ))`;
    }

    return { where: whereQuery, parameters };
  }

  /**
   * @todo get attributes from Entity, based on user selection
   * @todo simplification level based on zoom level
   */
  public async findTile(
    tileSpecification: TileSpecification,
    forProject: boolean,
    bbox?: BBox,
  ): Promise<Buffer> {
    const { z, x, y, id } = tileSpecification;
    const simplificationLevel = 360 / (Math.pow(2, z + 1) * 100);
    const attributes = forProject
      ? 'feature_id, amount'
      : 'feature_id, properties';
    const table = forProject
      ? `(SELECT ST_RemoveRepeatedPoints((st_dump(the_geom)).geom, ${simplificationLevel}) AS the_geom,
                 amount,
                 feature_id
                 FROM feature_amounts_per_planning_unit
                 INNER JOIN projects_pu ppu on ppu.id=feature_amounts_per_planning_unit.project_pu_id
                 INNER JOIN planning_units_geom pug on pug.id=ppu.geom_id)`
      : `(select ST_RemoveRepeatedPoints((st_dump(the_geom)).geom, ${simplificationLevel}) as the_geom,
                 (coalesce(properties,'{}'::jsonb) || jsonb_build_object('amount', amount)) as properties,
                 feature_id,
                 stable_id
                 from "${this.featuresRepository.metadata.tableName}")`;

    const { where: customQuery, parameters: customQueryParameters } =
      await this.buildFeaturesWhereQuery(id, forProject, bbox);
    return this.tileService.getTile({
      z,
      x,
      y,
      table,
      customQuery,
      customQueryParameters,
      attributes,
    });
  }
}
