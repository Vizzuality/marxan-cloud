import { Injectable, Logger, Inject } from '@nestjs/common';
import {
  TileService,
  TileRequest,
} from '@marxan-geoprocessing/modules/tile/tile.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { IsString, IsArray, IsIn,IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

import { ScenariosPuPaDataGeo } from '@marxan/scenarios-planning-unit';


const includeSelections = {
  'protection':{
    'attributes':', "percentageProtected"'
  },
  'features':{
    'attributes':''
  },
  'cost':{
    'attributes':', cost_cost as cost'
  },
  'lock-status':{
    'attributes':', test_lockin_status as "lockinStatus"'
  },
  'results':{
    'attributes':', "output_included_count" as "includedCount", \
                "valuePosition"'
  },
};
export class ScenariosPUFilters {
  // @IsOptional()
  // @IsArray()
  // @IsString({ each: true })
  // @IsIn(Object.keys(includeSelections), {
  //   each: true,
  // })
  // @Transform((value: string): Array<String> => JSON.parse(value))
  // include?: Array<String>;
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
    // const attributes = 'test_pu_geom_id as "puGeomId",\
    //    test_id as "scenarioPuId",\
    //    test_puid as "puid", \
    //    "percentageProtected",  \
    //    cost_cost as cost, \
    //    test_lockin_status as "lockinStatus", \
    //    "output_included_count" as "includedCount", "valuePosition"';
       const attributes = '*'
    /**
     * @todo: avoid sql injection in the scenario Id.
     * @todo: provide features id array
     * @todo: provide results/output data
     */
    let sql = this.ScenariosPlanningUnitGeoEntityRepository.createQueryBuilder(
      'test',
    ).addSelect('plan.the_geom')
    .addSelect(`'-'||array_to_string(array_positions(output.value, true),'-,-')||'-' as "valuePosition"`)
    .addSelect(`'valuePosition, featureList' as "parseKeys"`)
    .addSelect('round((test.protected_area/plan.area)::numeric*100)::int as "percentageProtected"')
    .addSelect(`feature_list as "featureList"`)
    .leftJoinAndSelect('planning_units_geom', 'plan', `test.pu_geom_id = plan.id`)
    .leftJoinAndSelect('scenarios_pu_cost_data', 'cost', `test.id = cost.scenarios_pu_data_id`)
    .leftJoinAndSelect('output_scenarios_pu_data', 'output',`test.id = output.scenario_pu_id`)
    .leftJoin('scenario_pu_features_entity', 'features', 'test.id = features.scenario_pu_id')
    .where(`"test"."scenario_id" = '${id}'`);

    const table = `(${sql.getSql()})`;

    return this.tileService.getTile({
      z,
      x,
      y,
      table,
      attributes,
    });
  }

  private selectJoins(qB: SelectQueryBuilder<ScenariosPuPaDataGeo>, _filters?: ScenariosPUFilters): SelectQueryBuilder<ScenariosPuPaDataGeo> {
    
    
    return qB.addSelect('plan.the_geom')
    .addSelect(`'-'||array_to_string(array_positions(output.value, true),'-,-')||'-' as "valuePosition"`)
    .addSelect(`'valuePosition, featureList' as "parseKeys"`)
    .addSelect('round((test.protected_area/plan.area)::numeric*100)::int as "percentageProtected"')
    .addSelect(`feature_list as "featureList"`)
    .leftJoinAndSelect('planning_units_geom', 'plan', `test.pu_geom_id = plan.id`)
    .leftJoinAndSelect('scenarios_pu_cost_data', 'cost', `test.id = cost.scenarios_pu_data_id`)
    .leftJoinAndSelect('output_scenarios_pu_data', 'output',`test.id = output.scenario_pu_id`)
    .leftJoin('scenario_pu_features_entity', 'features', 'test.id = features.scenario_pu_id')
  }

}


