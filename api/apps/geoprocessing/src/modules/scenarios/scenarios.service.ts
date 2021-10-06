import { Inject, Injectable, Logger } from '@nestjs/common';
import { TileService } from '@marxan-geoprocessing/modules/tile/tile.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

import { ScenariosPuPaDataGeo } from '@marxan/scenarios-planning-unit';
import { TileRequest } from '@marxan/tiles';

interface SelectionsProperties {
  attributes: string;
  select?: string;
  table?: string;
  alias?: string;
  condition?: string;
}

interface IncludeSelections {
  [key: string]: SelectionsProperties;
}

const includeSelections: IncludeSelections = {
  protection: {
    attributes: ', "percentageProtected"',
    select:
      'round((COALESCE(test.protected_area, 0)/plan.area)::numeric*100)::int as "percentageProtected"',
  },
  'lock-status': {
    attributes: ', "lockinStatus"',
    select: 'lockin_status as "lockinStatus"',
  },
  features: {
    attributes: ', "featureList"',
    select: 'feature_list as "featureList"',
    alias: 'features',
    condition: 'test.id = features.scenario_pu_id',
  },
  cost: {
    attributes: ', "costValue"',
    select: 'COALESCE(cost,1) as "costValue"',
    table: 'scenarios_pu_cost_data',
    alias: 'cost',
    condition: 'test.id = cost.scenarios_pu_data_id',
  },
  results: {
    attributes: ', "frequencyValue", "valuePosition"',
    select: `'-'||array_to_string(array_positions(output.value, true),'-,-')||'-' as "valuePosition", \
          round((output.included_count/array_length(output.value, 1)::numeric)*100)::int as "frequencyValue"`,
    table: 'output_scenarios_pu_data',
    alias: 'output',
    condition: 'test.id = output.scenario_pu_id',
  },
};
const includeSelectionsKeys: string[] = Object.keys(includeSelections);

export class ScenariosPUFilters {
  @IsOptional()
  @IsArray()
  @IsIn(includeSelectionsKeys, { each: true })
  @IsString({ each: true })
  @Transform((value: string) => value.split(','))
  include?: Array<string>;
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
   * @todo get attributes from Entity, based on user selection
   */
  public findTile(
    tileSpecification: ScenariosTileRequest,
    _filters?: ScenariosPUFilters,
  ): Promise<Buffer> {
    const { id, z, x, y } = tileSpecification;
    /**
     * @todo: rework the way columns are being named.
     * @todo probably this is not the most kosher solution
     */

    const attributes = this.attributeComposer(
      `test_pu_geom_id as "puGeomId",\
       test_id as "scenarioPuId",\
       test_puid as "puid", \
       'valuePosition,featureList' as "parseKeys"`,
      _filters,
    );
    /**
     * @todo: avoid sql injection in the scenario Id.
     * @todo: provide features id array
     * @todo: provide results/output data
     */
    const sql = this.selectJoins(
      id,
      this.ScenariosPlanningUnitGeoEntityRepository.createQueryBuilder('test')
        .addSelect('plan.the_geom')
        .leftJoin('planning_units_geom', 'plan', `test.pu_geom_id = plan.id`)
        .where(`"test"."scenario_id" = '${id}'`),
      _filters,
    );

    const table = `(${sql.getSql()})`;

    return this.tileService.getTile({
      z,
      x,
      y,
      table,
      attributes,
    });
  }

  /**
   * @description this will control the logic to properly build the includes.
   * @param qB
   * @param _filters
   * @returns qB
   */
  private selectJoins(
    id: string,
    qB: SelectQueryBuilder<ScenariosPuPaDataGeo>,
    _filters?: ScenariosPUFilters,
  ): SelectQueryBuilder<ScenariosPuPaDataGeo> {
    if (_filters?.include && _filters.include.length > 0) {
      _filters.include.forEach((element: string) => {
        if (includeSelections[element].select) {
          qB.addSelect(includeSelections[element].select!);
        }
        if (element == 'features') {
          includeSelections.features.table = `(select spd.scenario_id,
       spd.id,
       array_to_string(spd.feature_list, ','::text)
from scenarios_pu_data spd
where spd.scenario_id = '${id}')`;
        }
        if (includeSelections[element].table) {
          qB.leftJoin(
            includeSelections[element].table!,
            includeSelections[element].alias!,
            includeSelections[element].condition!,
          );
        }
      });
    }

    return qB;
  }

  /**
   *
   * @param base
   * @param _filters
   * @returns
   */
  private attributeComposer(
    base: string,
    _filters?: ScenariosPUFilters,
  ): string {
    if (_filters?.include && _filters.include.length > 0) {
      return _filters.include.reduce((init, element: string) => {
        return init.concat(includeSelections[element].attributes);
      }, base);
    }

    return base;
  }
}
