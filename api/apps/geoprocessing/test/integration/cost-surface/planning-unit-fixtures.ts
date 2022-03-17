import {
  PlanningUnitsGeom,
  ProjectsPuEntity,
} from '@marxan-jobs/planning-unit-geometry';
import { ScenariosPuCostDataGeo } from '@marxan/scenarios-planning-unit';
import { isDefined } from '@marxan/utils';
import { INestApplication } from '@nestjs/common';
import { getEntityManagerToken, getRepositoryToken } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { v4 } from 'uuid';
import { GivenScenarioPuDataExists } from '../../steps/given-scenario-pu-data-exists';

export const getFixtures = async (app: INestApplication) => {
  const projectId = v4();
  const scenarioId = v4();
  const entityManager = app.get(getEntityManagerToken());
  const projectsPuRepo: Repository<ProjectsPuEntity> = entityManager.getRepository(
    ProjectsPuEntity,
  );
  const planningUnitsGeomRepo: Repository<PlanningUnitsGeom> = app.get(
    getRepositoryToken(PlanningUnitsGeom),
  );
  const puCostDataRepo: Repository<ScenariosPuCostDataGeo> = app.get(
    getRepositoryToken(ScenariosPuCostDataGeo),
  );

  const scenarioPuData = await GivenScenarioPuDataExists(
    entityManager,
    projectId,
    scenarioId,
  );

  const puIds = scenarioPuData.map((row) => row.id);

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
          scenarioPuData.map((scenarioPuData) =>
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
      const projectsPu = await projectsPuRepo.find({
        where: {
          projectId,
        },
      });
      await planningUnitsGeomRepo.delete({
        id: In(projectsPu.map((pu) => pu.geomId)),
      });
    },
  };
};
