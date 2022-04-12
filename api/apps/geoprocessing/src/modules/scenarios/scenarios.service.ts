import { Inject, Injectable, Logger } from '@nestjs/common';
import { TileService } from '@marxan-geoprocessing/modules/tile/tile.service';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, SelectQueryBuilder } from 'typeorm';
import { IsArray, IsIn, IsOptional, IsString, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

import { ScenariosPuPaDataGeo } from '@marxan/scenarios-planning-unit';
import { TileRequest } from '@marxan/tiles';
import { promisify } from 'util';
import * as zlib from 'zlib';

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
      'round((COALESCE(spd.protected_area, 0)/pug.area)::numeric*100)::int as "percentageProtected"',
  },
  'lock-status': {
    attributes: ', "lockinStatus"',
    select: 'lockin_status as "lockinStatus"',
  },
  features: {
    attributes: ', "featureList"',
    select: 'array_to_string(feature_list, \',\') as "featureList"',
    alias: 'features',
  },
  cost: {
    attributes: ', "costValue"',
    select: 'COALESCE(cost,1) as "costValue"',
    table: 'scenarios_pu_cost_data',
    alias: 'cost',
    condition: 'spd.id = cost.scenarios_pu_data_id',
  },
  results: {
    attributes: ', "frequencyValue", "valuePosition"',
    select: `'-'||array_to_string(array_positions(output.value, true),'-,-')||'-' as "valuePosition", \
          round((output.included_count/array_length(output.value, 1)::numeric)*100)::int as "frequencyValue"`,
    table: 'output_scenarios_pu_data',
    alias: 'output',
    condition: 'spd.id = output.scenario_pu_id',
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

export class ScenariosWithBlmValueRequest extends ScenariosTileRequest {
  @IsNumber()
  @Transform((n) => Number.parseFloat(n))
  blmValue!: number;
}

@Injectable()
export class ScenariosService {
  private readonly logger: Logger = new Logger(ScenariosService.name);

  constructor(
    @InjectRepository(ScenariosPuPaDataGeo)
    private readonly scenariosPuDataRepository: Repository<ScenariosPuPaDataGeo>,
    @Inject(TileService)
    private readonly tileService: TileService,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  /**
   * @todo get attributes from Entity, based on user selection
   */
  public async findTile(
    tileSpecification: ScenariosTileRequest,
    _filters?: ScenariosPUFilters,
  ): Promise<Buffer> {
    const { id, z, x, y } = tileSpecification;
    /**
     * @todo: rework the way columns are being named.
     * @todo probably this is not the most kosher solution
     */

    const attributes = this.attributeComposer(
      `ppu_geom_id as "puGeomId",\
       spd_id as "scenarioPuId",\
       ppu_puid as "puid", \
       'valuePosition,featureList' as "parseKeys"`,
      _filters,
    );
    /**
     * @todo: avoid sql injection in the scenario Id.
     * @todo: provide features id array
     * @todo: provide results/output data
     */
    const qb = this.selectJoins(
      id,
      this.scenariosPuDataRepository
        .createQueryBuilder('spd')
        .addSelect('pug.the_geom')
        .addSelect('ppu.geom_id', 'ppu_geom_id')
        .addSelect('ppu.puid', 'ppu_puid')
        .leftJoin('projects_pu', 'ppu', 'spd.project_pu_id = ppu.id')
        .leftJoin('planning_units_geom', 'pug', `ppu.geom_id = pug.id`)
        .where(`"spd"."scenario_id" = '${id}'`),
      _filters,
    );

    const table = `(${qb.getSql()})`;

    return await this.tileService.getTile({
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

  public async findTileWithBlmValue(
    tileSpecification: ScenariosWithBlmValueRequest,
    geometry = 'the_geom',
    extent = 4096,
    buffer = 256,
    inputProjection = 4326,
  ): Promise<Buffer> {
    const { id, z, x, y, blmValue } = tileSpecification;

    const query = `with data as (select unnest(protected_pu_ids) as pu_ids 
    from blm_final_results bfr where blm_value = $1) 
    select ST_AsMVT(tile.*, 'layer0', ${extent}, 'mvt_geom') as mvt 
    from (select pu_ids, ST_AsMVTGeom(ST_Transform(${geometry}, 3857),
    ST_TileEnvelope(${z}, ${x}, ${y}), ${extent}, ${buffer}, true) AS mvt_geom from scenarios_pu_data spd 
    inner join projects_pu pp on pp.id = spd.project_pu_id
    inner join planning_units_geom pug on geom_id = pug.id 
    left join data on  pp.id = pu_ids
    where scenario_id = $2 
    and st_intersects(${geometry}, st_transform(ST_TileEnvelope(${z}, ${x}, ${y}), ${inputProjection})) ) as tile`;

    const result = await this.entityManager.query(query, [blmValue, id]);

    const gzip = promisify(zlib.gzip);
    return gzip(result[0].mvt);
  }
}
