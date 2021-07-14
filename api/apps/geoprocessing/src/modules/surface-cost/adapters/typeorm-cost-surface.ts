import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { flatten } from 'lodash';

import { CostSurfacePersistencePort } from '../ports/persistence/cost-surface-persistence.port';
import { PlanningUnitCost } from '../ports/planning-unit-cost';
import {
  ScenariosPlanningUnitGeoEntity,
  ScenariosPuCostDataGeo,
} from '@marxan/scenarios-planning-unit';
import { isDefined } from '@marxan/utils';

@Injectable()
export class TypeormCostSurface implements CostSurfacePersistencePort {
  constructor(
    @InjectRepository(ScenariosPuCostDataGeo)
    private readonly costs: Repository<ScenariosPuCostDataGeo>,
    @InjectRepository(ScenariosPlanningUnitGeoEntity)
    private readonly scenarioDataRepo: Repository<ScenariosPlanningUnitGeoEntity>,
  ) {
    //
  }

  async save(scenarioId: string, values: PlanningUnitCost[]): Promise<void> {
    const scenarioData = await this.scenarioDataRepo.find({
      where: {
        scenarioId,
        puGeometryId: In(values.map((pair) => pair.puId)),
      },
    });

    const pairs = this.getUpdatePairs(scenarioData, values);

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

  private getUpdatePairs(
    rows: ScenariosPlanningUnitGeoEntity[],
    values: PlanningUnitCost[],
  ): [string, number][] {
    return rows
      .map<[string, number | undefined]>((scenarioDataEntry) => [
        scenarioDataEntry.id,
        values.find((pair) => pair.puId === scenarioDataEntry.puGeometryId)
          ?.cost,
      ])
      .filter(this.hasCostDefined);
  }

  private hasCostDefined = (
    pair: [string, number | undefined],
  ): pair is [string, number] => isDefined(pair[1]);
}
