import { Injectable, Logger, Inject } from '@nestjs/common';
import {
  TileService,
  TileRequest,
} from '@marxan-geoprocessing/modules/tile/tile.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsString } from 'class-validator';

import { ScenariosPuPaDataGeo } from '@marxan/scenarios-planning-unit';

export class ScenariosPUFilters {}

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
   * @todo get attributes from Entity, based on user selection
   */
  public findTile(
    tileSpecification: ScenariosTileRequest,
    _filters?: ScenariosPUFilters,
  ): Promise<Buffer> {
    const { id, z, x, y } = tileSpecification;
    /**
     * @todo: rework the way columns are being named.
     */
    const attributes =
      'test_pu_geom_id as puGeomId,\
                        test_puid as puid,\
                        test_lockin_status as lockinStatus, \
                        test_protected_area as protectedArea';

    /**
     * @todo: avoid sql injection in the scenario Id.
     * @todo: provide features id array
     * @todo: provide results/output data
     */
    const sql = this.ScenariosPlanningUnitGeoEntityRepository.createQueryBuilder(
      'test',
    )
      .leftJoinAndSelect('test.planningUnitGeom', 'plan')
      .leftJoinAndSelect('test.costData', 'cost')
      .addSelect('plan.the_geom')
      .addSelect('cost.cost')
      .where(`scenario_id = '${id}'`);

    const table = `(${sql.getSql()})`;

    return this.tileService.getTile({
      z,
      x,
      y,
      table,
      attributes,
    });
  }
}
