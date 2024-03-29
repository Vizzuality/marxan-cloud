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
import { ProjectCostSurfaceProcessor } from '@marxan-geoprocessing/modules/cost-surface/application/project-cost-surface.processor';
import { CostSurfacePuDataEntity } from '@marxan/cost-surfaces';
import { ScenarioCostSurfaceProcessor } from '@marxan-geoprocessing/modules/cost-surface/application/scenario-cost-surface-processor.service';

export const getFixtures = async (app: INestApplication) => {
  const projectId = v4();
  const scenarioId = v4();
  const entityManager = app.get(getEntityManagerToken());
  const projectsPuRepo: Repository<ProjectsPuEntity> =
    entityManager.getRepository(ProjectsPuEntity);
  const planningUnitsGeomRepo: Repository<PlanningUnitsGeom> = app.get(
    getRepositoryToken(PlanningUnitsGeom),
  );
  const puCostDataRepo: Repository<ScenariosPuCostDataGeo> = app.get(
    getRepositoryToken(ScenariosPuCostDataGeo),
  );
  const costSurfacePuDataRepo: Repository<CostSurfacePuDataEntity> = app.get(
    getRepositoryToken(CostSurfacePuDataEntity),
  );

  const projectCostSurfaceProcessor: ProjectCostSurfaceProcessor = app.get(
    ProjectCostSurfaceProcessor,
  );
  const scenarioCostSurfaceProcessor: ScenarioCostSurfaceProcessor = app.get(
    ScenarioCostSurfaceProcessor,
  );

  let scenarioPuData = await GivenScenarioPuDataExists(
    entityManager,
    projectId,
    scenarioId,
  );

  const planningUnitsIds = scenarioPuData.map((row) => row.id);
  const planningUnitsPuids = scenarioPuData.map((row) => row.projectPu.puid);

  return {
    projectCostSurfaceProcessor,
    scenarioCostSurfaceProcessor,
    costSurfacePuDataRepo,
    planningUnitDataRepo: scenarioPuData,
    planningUnitCostDataRepo: puCostDataRepo,
    scenarioId,
    planningUnitsIds,
    planningUnitsPuids,
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
    GivenScenarioPuDataExists: async (
      projectId: string,
      scenarioId: string,
    ) => {
      scenarioPuData = await GivenScenarioPuDataExists(
        entityManager,
        projectId,
        scenarioId,
      );
    },
    GivenCostSurfacePuDataExists: async (costSurfaceId: string) => {
      await costSurfacePuDataRepo.save(
        scenarioPuData.map((scenarioPu) =>
          costSurfacePuDataRepo.create({
            costSurfaceId,
            projectsPuId: scenarioPu.projectPuId,
            cost: 42,
          }),
        ),
      );
    },
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
