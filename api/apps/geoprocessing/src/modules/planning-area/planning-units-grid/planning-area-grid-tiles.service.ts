import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TileService } from '@marxan-geoprocessing/modules/tile/tile.service';
import { Repository } from 'typeorm';
import { TileSpecification } from '@marxan-geoprocessing/modules/planning-area/planning-area-tiles/planning-area-tiles.service';
import { PlanningUnitsGeom } from '@marxan-jobs/planning-unit-geometry';

@Injectable()
export class PlanningAreaGridTilesService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    @InjectRepository(PlanningUnitsGeom)
    private readonly repository: Repository<PlanningUnitsGeom>,
    @Inject('TileService')
    private readonly tileService: TileService,
  ) {}

  buildCustomPlanningAreaWhereQuery(planningAreaId: string): string {
    /**
     * @todo this generation query is a bit...
     */
    let whereQuery = `project_id = '${planningAreaId}'`;

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
