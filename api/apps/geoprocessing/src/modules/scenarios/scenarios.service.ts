import { Injectable, Logger, Inject } from '@nestjs/common';
import {
  TileService,
  TileRequest,
} from '@marxan-geoprocessing/modules/tile/tile.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IsString,
} from 'class-validator';

import { ScenariosPuPaDataGeo } from '@marxan/scenarios-planning-unit/scenarios-pu-pa-data.geo.entity';

export class ScenariosPUFilters {
}

export class ScenariosTileRequest extends TileRequest {
  @IsString()
  id!: string;
}

@Injectable()
export class ScenariosService {
  private readonly logger: Logger = new Logger(ScenariosService.name);
  constructor(
    @InjectRepository(ScenariosPuPaDataGeo)
    private readonly ScenariosPlanningUnitGeoEntityRepository: Repository<ScenariosPuPaDataGeo>,
    @Inject(TileService)
    private readonly tileService: TileService,
  ) {}

  /**
   * @param filters bounding box of the area where the grids would be generated
   */
   buildScenarioPuWhereQuery(
    filters?: ScenariosPUFilters,
  ): string | undefined {
    let whereQuery = undefined;

    return whereQuery;
  }

  /**
   * @todo get attributes from Entity, based on user selection
   */
  public findTile(
    tileSpecification: ScenariosTileRequest,
    filters?: ScenariosPUFilters,
  ): Promise<Buffer> {
    const {id, z, x, y } = tileSpecification;
    const attributes = 'test_pu_geom_id, test_pu_geom_id, test_puid,\
                           test_lockin_status, test_protected_area';

    /**
     * @todo: avoid sql injection in the scenario Id.
     * @todo: provide features id array
     * @todo: provide results/output data
     */
    const sql = this.ScenariosPlanningUnitGeoEntityRepository
      .createQueryBuilder('test')
      .leftJoinAndSelect("test.planning", "plan")
      .leftJoinAndSelect("test.cost", "cost")
      .addSelect("plan.the_geom")
      .addSelect("cost.cost")
      .where(`scenario_id = '${id}'`)

    const table = `(${sql.getSql()})`;
    const customQuery = this.buildScenarioPuWhereQuery(filters);
    return this.tileService.getTile({
      z,
      x,
      y,
      table,
      attributes,
      customQuery,
    });
  }
}
