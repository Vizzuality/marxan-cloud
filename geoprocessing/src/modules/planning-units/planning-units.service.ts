import { Injectable, Logger, Inject } from '@nestjs/common';
import { TileService, TileRequest } from 'src/modules/tile/tile.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PlanningUnitsGeom } from 'src/modules/planning-units/planning-units.geo.entity';

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
   * @todo get attributes from Entity, based on user selection
   */
  public findTile(tileSpecification: TileRequest): Promise<Buffer> {
    const { z, x, y } = tileSpecification;
    const attributes = 'id';
    const table = this.protectedAreasRepository.metadata.tableName;
    const customQuery = undefined;
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
