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

  /**
   * @todo get attributes from Entity, based on user selection
   */
  public findTile(tileSpecification: TileSpecification): Promise<Buffer> {
    const { z, x, y, planningAreaId } = tileSpecification;
    const attributes = 'planning_area_id as planningAreaId';

    const qb = this.repository
      .createQueryBuilder('pug')
      .select('ppu.planning_area_id', 'planning_area_id')
      .addSelect('pug.the_geom', 'the_geom')
      .innerJoin('projects_pu', 'ppu', 'pug.id = ppu.geom_id')
      .where(`ppu.planning_area_id = '${planningAreaId}'`);
    const table = `(${qb.getSql()})`;
    return this.tileService.getTile({
      z,
      x,
      y,
      table,
      attributes,
    });
  }
}
