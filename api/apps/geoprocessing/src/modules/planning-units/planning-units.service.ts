import { Injectable, Logger, Inject } from '@nestjs/common';
import { PlanningUnitGridShape } from '@marxan/scenarios-planning-unit';
import { TileService } from '@marxan-geoprocessing/modules/tile/tile.service';
import { IsOptional, IsString, IsArray, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BBox } from 'geojson';
import { Transform } from 'class-transformer';

import { nominatim2bbox } from '@marxan-geoprocessing/utils/bbox.utils';
import { TileRequest } from '@marxan/tiles';

enum RegularPlanningUnitGridShape {
  hexagon = PlanningUnitGridShape.Hexagon,
  square = PlanningUnitGridShape.Square,
}

export class tileSpecification extends TileRequest {
  @ApiProperty()
  @IsString()
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
  constructor(
    @Inject(TileService)
    private readonly tileService: TileService,
  ) {}

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
    const {
      z,
      x,
      y,
      planningUnitGridShape,
      planningUnitAreakm2,
    } = tileSpecification;

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
    const gridShape = this.regularFunctionGridSelector(planningUnitGridShape);
    const gridSize = this.calculateGridSize(planningUnitAreakm2);
    // 156412 references to m per pixel at z level 0 at the equator in EPSG:3857
    const ratioPixelExtent = gridSize / (156412 / 2 ** z);
    /**
     * We are checking that the pixel ration is < 8 px and bbox is not present
     * Because we want to reduce the overhead for the db if an uncontroled area requests
     * a large area.
     * If so the shape we are getting is down the optimal to visualize it as points
     */
    const query =
      ratioPixelExtent < 8 && !filters?.bbox
        ? `( SELECT row_number() over() as id, st_centroid((${gridShape}(${gridSize}, \
        ST_Transform(ST_TileEnvelope(${z}, ${x}, ${y}), 3857))).geom ) as the_geom )`
        : `( SELECT row_number() over() as id, (${gridShape}(${gridSize}, \
                    ST_Transform(ST_TileEnvelope(${z}, ${x}, ${y}), 3857))).geom as the_geom)`;

    return query;
  }
  /**
   * @param filters including only bounding box of the area where the grids would be generated
   */
  private buildPlanningUnitsWhereQuery(filters?: PlanningUnitsFilters): string {
    let whereQuery = ``;

    if (filters?.bbox) {
      whereQuery = `st_intersects(ST_Transform(ST_MakeEnvelope(${nominatim2bbox(
        filters.bbox,
      )}, 4326), 3857) ,the_geom)`;
    }
    return whereQuery;
  }

  /**
   * @param planningUnitGridShape the grid shape that would be use for generating the grid. This grid shape
   * can be square or hexagon. If any grid shape is provided, square would be the default.
   */
  private regularFunctionGridSelector(
    planningUnitGridShape: RegularPlanningUnitGridShape,
  ): string {
    const functionEquivalence: {
      [key in keyof typeof RegularPlanningUnitGridShape]: string;
    } = {
      hexagon: 'ST_HexagonGrid',
      square: 'ST_SquareGrid',
    };

    return functionEquivalence[planningUnitGridShape];
  }
  /**
   *
   * @param planningUnitAreakm2
   * @returns grid h size in m
   */
  private calculateGridSize(planningUnitAreakm2: number): number {
    return Math.sqrt(planningUnitAreakm2) * 1000;
  }
}
