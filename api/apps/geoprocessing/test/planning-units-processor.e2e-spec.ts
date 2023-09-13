import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import {
  PlanningUnitsGeom,
  ProjectsPuEntity,
} from '@marxan-jobs/planning-unit-geometry';
import { PlanningUnitsJob } from '@marxan-jobs/planning-unit-geometry/create.regular.planning-units.dto';
import { Test } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Job } from 'bullmq';
import { In, Repository } from 'typeorm';
import {
  PlanningUnitsJobProcessor,
  RegularPlanningAreaJob,
} from '../src/modules/planning-units/planning-units.job';
import { E2E_CONFIG } from './e2e.config';
import { seedAdminRegions } from './utils/seeds/seed-admin-regions';
import { CostSurfacePuDataEntity } from '@marxan/cost-surfaces';
import { v4 } from 'uuid';

/**
 * @TODO
 * we need to add a couple of test that cath errors on invalid user input.
 */
describe('planning units jobs (e2e)', () => {
  let sut: PlanningUnitsJobProcessor;
  let data: PlanningUnitsJob;
  let projectsPuRepo: Repository<ProjectsPuEntity>;
  let planningUnitsRepo: Repository<PlanningUnitsGeom>;
  let costPuDataRepo: Repository<CostSurfacePuDataEntity>;

  beforeEach(async () => {
    const sandbox = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...geoprocessingConnections.default,
          keepConnectionAlive: true,
          logging: false,
        }),
        TypeOrmModule.forFeature(
          [ProjectsPuEntity, PlanningUnitsGeom, CostSurfacePuDataEntity],
          geoprocessingConnections.default,
        ),
      ],
      providers: [PlanningUnitsJobProcessor],
    }).compile();

    projectsPuRepo = sandbox.get(getRepositoryToken(ProjectsPuEntity));
    costPuDataRepo = sandbox.get(getRepositoryToken(CostSurfacePuDataEntity));
    planningUnitsRepo = sandbox.get(getRepositoryToken(PlanningUnitsGeom));
    sut = sandbox.get(PlanningUnitsJobProcessor);

    await seedAdminRegions(sandbox);
  });

  afterEach(async () => {
    const projectId = data.projectId;

    const projectPus = await projectsPuRepo.find({ where: { projectId } });
    const geometriesIds = projectPus.map((projectPu) => projectPu.geomId);

    await planningUnitsRepo.delete({ id: In(geometriesIds) });
  });

  it(
    'executes the child job processor with mock data',
    async () => {
      data = E2E_CONFIG.planningUnits.creationJob.valid.customArea({
        countryCode: 'NAM',
        adminAreaLevel1Id: 'NAM.13_1',
        adminAreaLevel2Id: 'NAM.13.5_1',
      });

      const createPlanningUnitsDTO = {
        id: '1',
        name: 'create-regular-pu',
        data: {
          ...data,
          costSurfaceId: v4(),
        },
      } as Job<RegularPlanningAreaJob>;

      await expect(sut.process(createPlanningUnitsDTO)).resolves.not.toThrow();

      const projectPus = await projectsPuRepo.find({
        where: {
          projectId: data.projectId,
        },
      });
      const costPus = await costPuDataRepo.find({
        where: { puid: In(projectPus.map((pu) => pu.id)) },
      });

      expect(projectPus.length).toBeGreaterThan(0);
      expect(costPus.length).toEqual(projectPus.length);
    },
    50 * 1000,
  );
});
