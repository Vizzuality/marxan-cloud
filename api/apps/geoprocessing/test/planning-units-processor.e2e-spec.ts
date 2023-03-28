import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import {
  PlanningUnitsGeom,
  ProjectsPuEntity,
} from '@marxan-jobs/planning-unit-geometry';
import { PlanningUnitsJob } from '@marxan-jobs/planning-unit-geometry/create.regular.planning-units.dto';
import { Test } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Job } from 'bullmq';
import { getConnection, In, Repository } from 'typeorm';
import {
  PlanningUnitsJobProcessor,
  RegularPlanningAreaJob,
} from '../src/modules/planning-units/planning-units.job';
import { E2E_CONFIG } from './e2e.config';
import { seedAdminRegions } from './utils/seeds/seed-admin-regions';

/**
 * @TODO
 * we need to add a couple of test that cath errors on invalid user input.
 */
describe('planning units jobs (e2e)', () => {
  let sut: PlanningUnitsJobProcessor;
  let data: PlanningUnitsJob;
  let projectsPuRepo: Repository<ProjectsPuEntity>;
  let planningUnitsRepo: Repository<PlanningUnitsGeom>;

  beforeEach(async () => {
    const sandbox = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...geoprocessingConnections.default,
          keepConnectionAlive: true,
          logging: false,
        }),
        TypeOrmModule.forFeature(
          [ProjectsPuEntity, PlanningUnitsGeom],
          geoprocessingConnections.default,
        ),
      ],
      providers: [PlanningUnitsJobProcessor],
    }).compile();

    projectsPuRepo = sandbox.get(getRepositoryToken(ProjectsPuEntity));
    planningUnitsRepo = sandbox.get(getRepositoryToken(PlanningUnitsGeom));
    sut = sandbox.get(PlanningUnitsJobProcessor);

    await seedAdminRegions();
  });

  afterEach(async () => {
    const projectId = data.projectId;

    const projectPus = await projectsPuRepo.find({ projectId });
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
        data,
      } as Job<RegularPlanningAreaJob>;

      await expect(sut.process(createPlanningUnitsDTO)).resolves.not.toThrow();

      const projectPus = await projectsPuRepo.find({
        projectId: data.projectId,
      });

      expect(projectPus.length).toBeGreaterThan(0);
    },
    50 * 1000,
  );
});
