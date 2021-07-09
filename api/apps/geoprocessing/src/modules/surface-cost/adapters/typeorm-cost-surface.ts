import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { flatten } from 'lodash';

import { CostSurfacePersistencePort } from '../ports/persistence/cost-surface-persistence.port';
import { PlanningUnitCost } from '../ports/planning-unit-cost';
import { ScenariosPuCostDataGeo } from '@marxan/scenarios-planning-unit';

@Injectable()
export class TypeormCostSurface implements CostSurfacePersistencePort {
  private readonly logger = new Logger('test')
  constructor(
    @InjectRepository(ScenariosPuCostDataGeo)
    private readonly costs: Repository<ScenariosPuCostDataGeo>
  ) {
    //
  }

  async save(_: string, values: PlanningUnitCost[]): Promise<void> {
    const pairs = values.map<[string, number]>((pair) => [
      pair.puId,
      pair.cost,
    ]);
    const vals = this.generateParametrizedValues(pairs);
    this.logger
    await this.costs.query(
      `
    UPDATE scenarios_pu_cost_data as spd
    set "cost" = pucd.new_cost
    from (values
        ${this.generateParametrizedValues(pairs)}
    ) as pucd(id, new_cost)
    where pucd.id = spd.scenarios_pu_data_id
    `,
      flatten(pairs),
    );
    return;
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
