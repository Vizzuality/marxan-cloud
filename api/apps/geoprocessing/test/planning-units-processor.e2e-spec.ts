import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import {
  PlanningUnitsGeom,
  ProjectsPuEntity,
} from '@marxan-jobs/planning-unit-geometry';
import { PlanningUnitsJob } from '@marxan-jobs/planning-unit-geometry/create.regular.planning-units.dto';
import { Test, TestingModule } from '@nestjs/testing';
import {
  getEntityManagerToken,
  getRepositoryToken,
  TypeOrmModule,
} from '@nestjs/typeorm';
import { Job } from 'bullmq';
import { EntityManager, In, Repository } from 'typeorm';
import { E2E_CONFIG } from './e2e.config';
import { seedAdminRegions } from './utils/seeds/seed-admin-regions';
import { CostSurfacePuDataEntity } from '@marxan/cost-surfaces';
import { v4 } from 'uuid';
import { ProjectCostSurfaceModule } from '@marxan-geoprocessing/modules/cost-surface/project/project-cost-surface.module';
import {
  PlanningUnitsJobProcessor,
  RegularPlanningAreaJob,
} from '@marxan-geoprocessing/modules/planning-units/planning-units.job';

/**
 * @TODO
 * we need to add a couple of test that cath errors on invalid user input.
 */
describe('planning units jobs (e2e)', () => {
  let fixtures: any;

  beforeEach(async () => {
    const sandbox = await Test.createTestingModule({
      imports: [
        ProjectCostSurfaceModule,
        TypeOrmModule.forRoot({
          ...geoprocessingConnections.default,
          keepConnectionAlive: true,
          logging: false,
        }),
        TypeOrmModule.forRoot({
          ...geoprocessingConnections.apiDB,
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

    await seedAdminRegions(sandbox);

    fixtures = await getPlanningAreaFixtures(sandbox);
  });

  afterEach(async () => {
    await fixtures.cleanup();
  });

  it('executes the child job processor with mock data', async () => {
    const data = E2E_CONFIG.planningUnits.creationJob.valid.customArea({
      countryCode: 'NAM',
      adminAreaLevel1Id: 'NAM.13_1',
      adminAreaLevel2Id: 'NAM.13.5_1',
    });
    const job = fixtures.GivenCreatePlanningUnitJob(data);

    await fixtures.WhenProcessingJob(job);

    await fixtures.ThenPusWereSaved(data.projectId);
  });

  it('updates min/max on associated cost surface metadata', async () => {
    const projectId1 = await fixtures.GivenProjectMetadata();
    const projectId2 = await fixtures.GivenProjectMetadata();
    const costSurfaceId1 = await fixtures.GivenCostSurfaceMetadata(
      projectId1,
      true,
    );
    const costSurfaceId2 = await fixtures.GivenCostSurfaceMetadata(
      projectId2,
      true,
    );
    const data1 = E2E_CONFIG.planningUnits.creationJob.valid.customArea({
      countryCode: 'NAM',
      adminAreaLevel1Id: 'NAM.13_1',
      adminAreaLevel2Id: 'NAM.13.5_1',
      planningUnitAreakm2: 23,
      projectId: projectId1,
      costSurfaceId: costSurfaceId1,
    });

    const data2 = E2E_CONFIG.planningUnits.creationJob.valid.customArea({
      countryCode: 'NAM',
      adminAreaLevel1Id: 'NAM.13_1',
      adminAreaLevel2Id: 'NAM.13.5_1',
      planningUnitAreakm2: 76,
      projectId: projectId2,
      costSurfaceId: costSurfaceId2,
    });

    const job1 = fixtures.GivenCreatePlanningUnitJob(data1);
    const job2 = fixtures.GivenCreatePlanningUnitJob(data2);

    await fixtures.WhenProcessingJob(job1);
    await fixtures.WhenProcessingJob(job2);

    await fixtures.ThenPusWereSaved(data1.projectId);
    await fixtures.ThenPusWereSaved(data2.projectId);
    await fixtures.ThenMinMaxForCostSurfaceMetadataWasUpdated(
      data1.costSurfaceId!,
      { min: 23, max: 23 },
    );
    await fixtures.ThenMinMaxForCostSurfaceMetadataWasUpdated(
      data2.costSurfaceId!,
      { min: 76, max: 76 },
    );
  });
});

const getPlanningAreaFixtures = async (sandbox: TestingModule) => {
  const sut = sandbox.get(PlanningUnitsJobProcessor);

  const projectsPuRepo: Repository<ProjectsPuEntity> = sandbox.get(
    getRepositoryToken(ProjectsPuEntity),
  );
  const costPuDataRepo: Repository<CostSurfacePuDataEntity> = sandbox.get(
    getRepositoryToken(CostSurfacePuDataEntity),
  );
  const planningUnitsRepo: Repository<PlanningUnitsGeom> = sandbox.get(
    getRepositoryToken(PlanningUnitsGeom),
  );

  const apiEntityManager: EntityManager = sandbox.get(
    getEntityManagerToken(geoprocessingConnections.apiDB.name),
  );

  return {
    cleanup: async () => {
      await apiEntityManager
        .createQueryBuilder()
        .delete()
        .from('cost_surfaces')
        .execute();
      await apiEntityManager
        .createQueryBuilder()
        .delete()
        .from('projects')
        .execute();
      await apiEntityManager
        .createQueryBuilder()
        .delete()
        .from('organizations')
        .execute();

      await projectsPuRepo.delete({});
      await planningUnitsRepo.delete({});
    },

    GivenProjectMetadata: async () => {
      const organizationId = v4();
      await apiEntityManager
        .createQueryBuilder()
        .insert()
        .into('organizations')
        .values({ id: organizationId, name: organizationId })
        .execute();
      const projectId = v4();
      await apiEntityManager
        .createQueryBuilder()
        .insert()
        .into('projects')
        .values({
          id: projectId,
          name: projectId,
          organization_id: organizationId,
        })
        .execute();
      return projectId;
    },
    GivenCostSurfaceMetadata: async (projectId: string, isDefault: boolean) => {
      const id = v4();
      await apiEntityManager
        .createQueryBuilder()
        .insert()
        .into('cost_surfaces')
        .values({
          project_id: projectId,
          name: id,
          id,
          is_default: isDefault,
          min: 1,
          max: 1,
        })
        .execute();
      return id;
    },
    GivenCreatePlanningUnitJob: (data: PlanningUnitsJob) => {
      return {
        id: '1',
        name: 'create-regular-pu',
        data,
      } as Job<RegularPlanningAreaJob>;
    },

    WhenProcessingJob: async (createPlanningUnitJob: Job) => {
      await expect(sut.process(createPlanningUnitJob)).resolves.not.toThrow();
    },

    ThenPusWereSaved: async (projectId: string) => {
      const projectPus = await projectsPuRepo.find({
        where: {
          projectId,
        },
      });
      const costPus = await costPuDataRepo.find({
        where: { projectsPuId: In(projectPus.map((pu) => pu.id)) },
      });

      expect(projectPus.length).toBeGreaterThan(0);
      expect(costPus.length).toEqual(projectPus.length);
    },
    ThenMinMaxForCostSurfaceMetadataWasUpdated: async (
      costSurfaceId: string,
      range: { min: number; max: number },
    ) => {
      const [result] = await apiEntityManager
        .createQueryBuilder()
        .select('min')
        .addSelect('max')
        .from('cost_surfaces', 'cs')
        .where('id = :costSurfaceId and is_default = true', { costSurfaceId })
        .execute();

      expect(result.min).toBe(range.min);
      expect(result.max).toBe(range.max);
    },
  };
};
