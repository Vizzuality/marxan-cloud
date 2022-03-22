import { Injectable, Logger } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { nominatim2bbox } from '@marxan-geoprocessing/utils/bbox.utils';
import { TileService } from '@marxan-geoprocessing/modules/tile/tile.service';

import { ScenariosPuPaDataGeo } from '@marxan/scenarios-planning-unit';
import { ScenarioComparisonTileRequest } from './comparison-difference-tile-request';

type QueryResult = { mvt: Buffer };

@Injectable()
export class ScenarioComparisonTilesService {
  constructor(
    @InjectRepository(ScenariosPuPaDataGeo)
    private readonly areas: Repository<ScenariosPuPaDataGeo>,
    private readonly tileService: TileService,
  ) {}

  async getScenarioComparisonTile(
    request: ScenarioComparisonTileRequest,
  ): Promise<Buffer> {
    const tile = await this.getTiles(request);
    return this.tileService.zip(tile[0].mvt);
  }

  private async getTiles({
    z,
    x,
    y,
    scenarioIdA,
    scenarioIdB,
  }: ScenarioComparisonTileRequest): Promise<[QueryResult]> {
    const result = await this.areas.manager
      .query(
        `with t as (
        select the_geom, pu_geom_id, scenario_id, included_count / array_length(value,1)::float as freq
        from scenarios_pu_data spd
        inner join output_scenarios_pu_data osp on spd.id =osp.scenario_pu_id
        inner join planning_units_geom pug on spd.pu_geom_id = pug.id
        where spd.scenario_id  in ($1, $2)
        ),
        compare as (
        select q1.the_geom, q1.pu_geom_id as "puGeomId", q1.freq as "freqA",
          q2.freq as "freqB", q1.scenario_id as "scenarioIdA", q2.scenario_id as "scenarioIdB"
        from
        (select * from t where t.scenario_id = $1) q1
        LEFT JOIN lateral
        (select * from t where t.scenario_id = $2) q2
        on q1.pu_geom_id = q2.pu_geom_id
        where st_intersects(q1.the_geom, st_transform(ST_TileEnvelope($3, $4, $5), 4326))
        )
      select ST_AsMVT(tile.*, 'layer0', 4096, 'mvt_geom') as mvt
      from (
        select "puGeomId", "freqA", "freqB", "scenarioIdA", "scenarioIdB",
        ST_AsMVTGeom(ST_Transform(the_geom, 3857),
        ST_TileEnvelope($3, $4, $5), 4096, 256, true) AS mvt_geom
        from compare) as tile`,
        [scenarioIdA, scenarioIdB, z, x, y],
      )
      .catch((err_msg) => {
        Logger.error(err_msg);
      });

    return result;
  }
}
