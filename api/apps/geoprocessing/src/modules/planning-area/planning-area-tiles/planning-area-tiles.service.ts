import { Injectable, Inject, ConsoleLogger } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { InjectRepository } from '@nestjs/typeorm';
import { PlanningArea } from '@marxan/planning-area-repository/planning-area.geo.entity';
import { TileService } from '@marxan-geoprocessing/modules/tile/tile.service';
import { TileRequest } from '@marxan/tiles';
import { Repository } from 'typeorm';
export class TileSpecification extends TileRequest {
  @ApiProperty()
  @IsUUID()
  planningAreaId!: string;
}

@Injectable()
export class PlanningAreaTilesService {
  constructor(
    @InjectRepository(PlanningArea)
    private readonly repository: Repository<PlanningArea>,
    private readonly tileService: TileService,
    private readonly logger: ConsoleLogger,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  buildCustomPlanningAreaWhereQuery(planningAreaId: string): string {
    /**
     * @todo this generation query is a bit...
     */
    const whereQuery = `project_id = '${planningAreaId}'`;

    return whereQuery;
  }

  /**
   * @todo get attributes from Entity, based on user selection
   */
  public findTile(tileSpecification: TileSpecification): Promise<Buffer> {
    const { z, x, y, planningAreaId } = tileSpecification;
    const attributes = 'project_id as planningAreaId';
    const table = this.repository.metadata.tableName;
    const customQuery = this.buildCustomPlanningAreaWhereQuery(planningAreaId);
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
