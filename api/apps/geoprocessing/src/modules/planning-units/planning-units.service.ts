import { TileService } from '@marxan-geoprocessing/modules/tile/tile.service';
import { nominatim2bbox, antimeridianBbox } from '@marxan/utils/geo';
import { PlanningUnitGridShape } from '@marxan/scenarios-planning-unit';
import { TileRequest } from '@marxan/tiles';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsIn, IsNumber, IsOptional } from 'class-validator';
import { BBox } from 'geojson';
import {
  calculateGridSize,
  gridShapeFnMapping,
  RegularPlanningUnitGridShape,
} from './planning-units.job';

export class tileSpecification extends TileRequest {
  @ApiProperty()
  @IsIn([PlanningUnitGridShape.Hexagon, PlanningUnitGridShape.Square])
  planningUnitGridShape!: RegularPlanningUnitGridShape;

  @ApiProperty()
  @IsNumber()
  @Transform((value) => Number.parseInt(value))
  planningUnitAreakm2!: number;
}

export class PlanningUnitsFilters {
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Transform((value: string): BBox => JSON.parse(value))
  bbox?: BBox;
}

@Injectable()
export class PlanningUnitsService {
  private readonly logger: Logger = new Logger(PlanningUnitsService.name);

  constructor(private readonly tileService: TileService) {}

  /**
   * @todo findTile for entity:(already created grid for a scenario with join options of other entities)
   *
   * @param tileSpecification
   * @param filters so far only bbox is accepted
   * @returns vector tile
   */
  public findTile(
    tileSpecification: tileSpecification,
    filters?: PlanningUnitsFilters,
  ): Promise<Buffer> {
    const { z, x, y, planningUnitGridShape, planningUnitAreakm2 } =
      tileSpecification;

    const inputProjection = 3857;

    const attributes = 'id';
    const table = this.buildPlanningUnitsCustomQuery(
      x,
      y,
      z,
      planningUnitGridShape,
      planningUnitAreakm2,
      filters,
    );
    const customQuery = this.buildPlanningUnitsWhereQuery(filters);

    return this.tileService.getTile({
      z,
      x,
      y,
      table,
      attributes,
      inputProjection,
      customQuery,
    });
  }

  /**
   * @param x x param of a tiler system
   * @param y y param of a tiler system
   * @param z z param of a tiler system
   * @param planningUnitGridShape the grid shape that would be use for generating the grid. This grid shape
   * can be square or hexagon. If any grid shape is provided, square would be the default.
   * @param planningUnitAreakm2 area in km2 of the individual grid that would be generated.
   * If any value is not provided, 4000 would be the default.
   */
  private buildPlanningUnitsCustomQuery(
    x: number,
    y: number,
    z: number,
    planningUnitGridShape: RegularPlanningUnitGridShape,
    planningUnitAreakm2: number,
    filters?: PlanningUnitsFilters,
  ): string {
    const gridShapeFn = gridShapeFnMapping[planningUnitGridShape];
    const gridSize =
      calculateGridSize[planningUnitGridShape](planningUnitAreakm2);
    // 156412 references to m per pixel at z level 0 at the equator in EPSG:3857
    const ratioPixelExtent = gridSize / (156412 / 2 ** z);
    /**
     * We are checking that the pixel ration is < 8 px and bbox is not present
     * Because we want to reduce the overhead for the db if an uncontroled area requests
     * a large area.
     * If so the shape we are getting is down the optimal to visualize it as points
     *
     */
    const query =
      ratioPixelExtent < 8 && !filters?.bbox
        ? `( SELECT row_number() over() as id, st_centroid((${gridShapeFn}(${gridSize}, \
        ST_Transform(ST_TileEnvelope(${z}, ${x}, ${y}), 3857))).geom ) as the_geom )`
        : `( SELECT row_number() over() as id, (${gridShapeFn}(${gridSize}, \
                    ST_Transform(ST_TileEnvelope(${z}, ${x}, ${y}), 3857))).geom as the_geom)`;

    return query;
  }

  /**
   * @param filters including only bounding box of the area where the grids would be generated
   *
   */
  private buildPlanningUnitsWhereQuery(filters?: PlanningUnitsFilters): string {
    let whereQuery = ``;

    if (filters?.bbox) {
      const { westBbox, eastBbox } = antimeridianBbox(
        nominatim2bbox(filters.bbox),
      );
      whereQuery = `st_intersects(ST_Transform(st_intersection(ST_MakeEnvelope(${eastBbox}, 4326),
                                  ST_MakeEnvelope(0, -90, 180, 90, 4326)), 3857), the_geom)
                    OR
                    st_intersects(ST_Transform(st_intersection(ST_MakeEnvelope(${westBbox}, 4326),
                                  ST_MakeEnvelope(-180, -90, 0, 90, 4326)), 3857), the_geom)`;
    }
    return whereQuery;
  }
}
