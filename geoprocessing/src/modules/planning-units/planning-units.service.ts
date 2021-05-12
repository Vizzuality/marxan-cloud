import { Injectable, Logger, Inject } from '@nestjs/common';
import { TileService, TileRequest } from 'src/modules/tile/tile.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsOptional, IsString, IsArray, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BBox } from 'geojson';
import { Transform } from 'class-transformer';

import { PlanningUnitsGeom } from 'src/modules/planning-units/planning-units.geo.entity';

export class tileSpecification extends TileRequest {
  @ApiProperty()
  @IsString()
  planningUnitGridShape: PlanningUnitGridShape;

  @ApiProperty()
  @IsNumber()
  @Transform((value) => Number.parseInt(value))
  planningUnitAreakm2: number;


}
export enum PlanningUnitGridShape {
  square = 'square',
  hexagon = 'hexagon',
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
    @InjectRepository(PlanningUnitsGeom)
    private readonly protectedAreasRepository: Repository<PlanningUnitsGeom>,
    @Inject(TileService)
    private readonly tileService: TileService,
  ) {}

  /**
   * @param bbox boundingbox of the area where the grids would be generated
   * @param planningUnitGridShape the grid shape that would be use for generating the grid. This grid shape
   * can be square or hexagon. If any grid shape is provided, square would be the default.
   * @param planningUnitAreakm2 area in km2 of the individual grid that would be generated.
   * If any value is not provided, 4000 would be the default.
   */

  buildPlanningUnitsWhereQuery(
    x: number,
    y: number,
    z: number,
    planningUnitGridShape: PlanningUnitGridShape,
    planningUnitAreakm2: number,
    filters?: PlanningUnitsFilters): string {
    let PlanningUnitGridShape = '';
    let whereQuery = '';
    if (planningUnitGridShape == 'hexagon') {
      PlanningUnitGridShape =  'ST_HexagonGrid';
    }
    if (planningUnitGridShape == 'square') {
      PlanningUnitGridShape =  'ST_SquareGrid';
    }
    if (filters?.bbox) {
      whereQuery = `(${PlanningUnitGridShape}(${planningUnitAreakm2} * 1000000, ST_Transform(ST_MakeEnvelope(${filters?.bbox}), 3857)))`;
    }
    else {
      whereQuery = `(${PlanningUnitGridShape}(${planningUnitAreakm2} * 1000000, ST_Transform(ST_TileEnvelope(${z}, ${x}, ${y}), 4326), 3857)))`;
    }
    return whereQuery;
  }

  /**
   * @todo get attributes from Entity, based on user selection
   */
  public findTile(
    tileSpecification: tileSpecification,
    filters?: PlanningUnitsFilters
    ): Promise<Buffer> {
    const { z, x, y, planningUnitGridShape, planningUnitAreakm2  } = tileSpecification;
    const attributes = 'id';
    const table = this.protectedAreasRepository.metadata.tableName;
    const customQuery = undefined;
    const querytest = this.buildPlanningUnitsWhereQuery(
      z,
      x,
      y,
      planningUnitGridShape,
      planningUnitAreakm2,
      filters) ;
    return this.tileService.getTile({
      z,
      x,
      y,
      table,
      customQuery,
      attributes,
    });
  }
}
