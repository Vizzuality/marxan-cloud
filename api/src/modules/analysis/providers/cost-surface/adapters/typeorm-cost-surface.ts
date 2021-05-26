import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { flatten } from 'lodash';

import { CostSurfaceRepo } from '../cost-surface-repo';
import { CostSurfaceInputDto } from '../../../entry-points/adjust-cost-surface-input';
import { ScenariosPuCostDataGeo } from './scenarios-pu-cost-data.geo.entity';
import { DbConnections } from '../../../../../ormconfig.connections';

type Success = true;

@Injectable()
export class TypeormCostSurface implements CostSurfaceRepo {
  constructor(
    @InjectRepository(ScenariosPuCostDataGeo, DbConnections.geoprocessingDB)
    private readonly costs: Repository<ScenariosPuCostDataGeo>,
  ) {
    //
  }

  async applyCostSurface(
    _: string,
    values: CostSurfaceInputDto['planningUnits'],
  ): Promise<Success> {
    const pairs = values.map<[string, number]>((pair) => [pair.id, pair.cost]);
    await this.costs.query(
      `
    UPDATE scenarios_pu_cost_data as spd
    set "cost" = pucd.new_cost
    from (values
        ${this.generateParametrizedValues(pairs)}
    ) as pucd(output_results_data_id, new_cost)
    where pucd.output_results_data_id = spd.output_results_data_id
    `,
      flatten(pairs),
    );
    return true;
  }

  /**
   *
   * generates parametrized input for:
   * ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 5000::float)
   *
   * in form of:
   * ($1::uuid, $2::float),
   * ($3::uuid, $4::float),
   * ($5::uuid, $6::float),
   * ...
   *
   */
  private generateParametrizedValues(pairs: [string, number][]): string {
    return pairs
      .map(
        (_, index) =>
          `($${(index + 1) * 2 - 1}::uuid, $${(index + 1) * 2}::float)`,
      )
      .join(',');
  }
}
