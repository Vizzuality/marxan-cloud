import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import {
  ScenariosPlanningUnitGeoEntity,
  ScenariosPuCostDataGeo,
} from '@marxan/scenarios-planning-unit';

import { GivenScenarioPuDataExists } from '../../steps/given-scenario-pu-data-exists';
import { isDefined } from '@marxan/utils';

export const getFixtures = async (app: INestApplication) => {
  const scenarioId = v4();
  const puCostRepoToken = getRepositoryToken(ScenariosPuCostDataGeo);
  const puDataRepoToken = getRepositoryToken(ScenariosPlanningUnitGeoEntity);
  const puDataRepo: Repository<ScenariosPlanningUnitGeoEntity> = app.get(
    puDataRepoToken,
  );
  const puCostDataRepo: Repository<ScenariosPuCostDataGeo> = app.get(
    puCostRepoToken,
  );
  const scenarioPuData = await GivenScenarioPuDataExists(
    puDataRepo,
    scenarioId,
  );

  const puIds = scenarioPuData.rows.map((row) => row.id);

  return {
    planningUnitDataRepo: scenarioPuData,
    planningUnitCostDataRepo: puCostDataRepo,
    scenarioId,
    planningUnitsIds: puIds,
    scenarioPlanningUnitsGeometry: scenarioPuData,
    GetPuCostsData: async (
      scenarioId: string,
    ): Promise<{ scenario_id: string; cost: number; spud_id: string }[]> =>
      puCostDataRepo.query(`
        select spud.scenario_id, spucd."cost", spud.id as spud_id
        from scenarios_pu_data as spud
               join scenarios_pu_cost_data as spucd
                    on (spud."id" = spucd.scenarios_pu_data_id)
        where spud.scenario_id = '${scenarioId}'
      `),
    GivenPuCostDataExists: async () =>
      puCostDataRepo
        .save(
          scenarioPuData.rows.map((scenarioPuData) =>
            puCostDataRepo.create({
              scenariosPuDataId: scenarioPuData.id,
              cost: 300,
              scenariosPlanningUnit: scenarioPuData,
            }),
          ),
        )
        .then((rows) => rows.map((row) => row.scenariosPlanningUnit))
        .then((scenarioPlanningUnits) =>
          scenarioPlanningUnits.map((spu) => spu?.id).filter(isDefined),
        ),
    cleanup: async () => {
      await puDataRepo.delete({
        scenarioId,
      });
    },
  };
};
