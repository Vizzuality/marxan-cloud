import { bootstrapApplication } from '../utils/api-application';
import {
  getEntityManagerToken,
  getRepositoryToken,
  TypeOrmModule,
} from '@nestjs/typeorm';
import {
  PlanningUnitsGeom,
  ProjectsPuEntity,
} from '@marxan-jobs/planning-unit-geometry';
import {
  PlanningUnitGridShape,
  ScenariosPuCostDataGeo,
} from '@marxan/scenarios-planning-unit';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { GivenUserExists } from '../steps/given-user-exists';
import { EntityManager, Repository } from 'typeorm';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { Organization } from '@marxan-api/modules/organizations/organization.api.entity';
import {
  CostSurface,
  JSONAPICostSurface,
} from '@marxan-api/modules/cost-surface/cost-surface.api.entity';
import { UsersProjectsApiEntity } from '@marxan-api/modules/access-control/projects-acl/entity/users-projects.api.entity';
import { ProjectRoles } from '@marxan-api/modules/access-control/projects-acl/dto/user-role-project.dto';
import { GivenProjectExists } from '../steps/given-project';
import { GivenProjectsPu } from '../../../geoprocessing/test/steps/given-projects-pu-exists';
import * as request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { CqrsModule } from '@nestjs/cqrs';
import { EventBusTestUtils } from '../utils/event-bus.test.utils';
import { CostSurfaceDeleted } from '@marxan-api/modules/cost-surface/events/cost-surface-deleted.event';
import { FakeQueue } from '../utils/queues';
import { unusedResourcesCleanupQueueName } from '@marxan/unused-resources-cleanup';

export const getProjectCostSurfaceFixtures = async () => {
  const app = await bootstrapApplication(
    [
      CqrsModule,
      TypeOrmModule.forFeature(
        [PlanningUnitsGeom, ProjectsPuEntity, ScenariosPuCostDataGeo],
        DbConnections.geoprocessingDB,
      ),
    ],
    [EventBusTestUtils],
  );
  const eventBusTestUtils = app.get(EventBusTestUtils);
  eventBusTestUtils.startInspectingEvents();
  const unusedResourceCleanupQueue = FakeQueue.getByName(
    unusedResourcesCleanupQueueName,
  );

  const token = await GivenUserIsLoggedIn(app, 'aa');
  const userId = await GivenUserExists(app, 'aa');

  const geoEntityManager = app.get<EntityManager>(
    getEntityManagerToken(DbConnections.geoprocessingDB),
  );
  const projectsRepo: Repository<Project> = app.get(
    getRepositoryToken(Project),
  );
  const scenarioRepo: Repository<Scenario> = app.get(
    getRepositoryToken(Scenario),
  );
  const projectsPuRepo: Repository<ProjectsPuEntity> = app.get(
    getRepositoryToken(ProjectsPuEntity, DbConnections.geoprocessingDB),
  );
  const organizationRepo: Repository<Organization> = app.get(
    getRepositoryToken(Organization),
  );
  const costSurfaceRepo: Repository<CostSurface> = app.get(
    getRepositoryToken(CostSurface),
  );
  const usersProjectsApiRepo: Repository<UsersProjectsApiEntity> = app.get(
    getRepositoryToken(UsersProjectsApiEntity),
  );

  return {
    cleanup: async () => {
      await projectsRepo.delete({});
      await projectsPuRepo.delete({});
      await organizationRepo.delete({});
      await costSurfaceRepo.delete({});
      eventBusTestUtils.stopInspectingEvents();
      await app.close();
    },

    GivenProject: async (projectName: string, roles?: ProjectRoles[]) => {
      const { projectId, cleanup } = await GivenProjectExists(
        app,
        token,
        {
          name: projectName,
          countryId: undefined!,
        },
        {
          name: `Organization ${Date.now()}`,
        },
      );

      if (roles) {
        await usersProjectsApiRepo.delete({ projectId });
        await usersProjectsApiRepo.save(
          roles.map((roleName) => ({
            projectId,
            userId,
            roleName,
          })),
        );
      }

      return projectId;
    },
    WhenCreatingAProject: async (projectName: string) =>
      await GivenProjectExists(
        app,
        token,
        {
          name: projectName,
          countryId: undefined!,
        },
        {
          name: `Organization ${Date.now()}`,
        },
      ),
    GivenDefaultCostSurfaceForProject: async (projectId: string) => {
      return costSurfaceRepo.findOneOrFail({
        where: { projectId, isDefault: true },
      });
    },
    GivenScenario: async (
      projectId: string,
      costSurfaceId: string,
      name?: string,
    ) => {
      return scenarioRepo.save({
        projectId,
        costSurfaceId,
        name: name || `Scenario for project ${projectId}`,
      });
    },

    GivenProjectPuData: async (projectId: string) => {
      await GivenProjectsPu(
        geoEntityManager,
        projectId,
        3,
        PlanningUnitGridShape.Square,
      );
    },
    GivenCostSurfaceMetadataForProject: async (
      projectId: string,
      name: string,
      min = 0,
      max = 0,
    ) => {
      return await costSurfaceRepo.save(
        costSurfaceRepo.create({ name, projectId, min, max }),
      );
    },
    GivenMockCostSurfaceShapefile: () => {
      return __dirname + `/../upload-feature/import-files/wetlands.zip`;
    },

    WhenGettingCostSurfacesForProject: async (projectId: string) => {
      return request(app.getHttpServer())
        .get(`/api/v1/projects/${projectId}/cost-surfaces`)
        .set('Authorization', `Bearer ${token}`);
    },
    WhenGettingCostSurfaceForProject: async (projectId: string, id: string) => {
      return request(app.getHttpServer())
        .get(`/api/v1/projects/${projectId}/cost-surfaces/${id}`)
        .set('Authorization', `Bearer ${token}`);
    },
    WhenUploadingCostSurfaceShapefileForProject: async (
      projectId: string,
      costSurfaceName: string,
      shapefilePath: string,
    ) => {
      return request(app.getHttpServer())
        .post(`/api/v1/projects/${projectId}/cost-surfaces/shapefile`)
        .set('Authorization', `Bearer ${token}`)
        .attach(`file`, shapefilePath)
        .field({
          name: costSurfaceName,
        });
    },
    WhenUpdatingCostSurfaceForProject: async (
      projectId: string,
      costSurfaceId: string,
      costSurfaceName: string,
    ) => {
      return request(app.getHttpServer())
        .patch(`/api/v1/projects/${projectId}/cost-surfaces/${costSurfaceId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: costSurfaceName });
    },
    WhenDeletingCostSurface: async (
      projectId: string,
      costSurfaceId: string,
    ) => {
      return request(app.getHttpServer())
        .delete(`/api/v1/projects/${projectId}/cost-surfaces/${costSurfaceId}`)
        .set('Authorization', `Bearer ${token}`);
    },

    WhenGettingCostSurfaceRange: async (
      costSurfaceId: string,
      projectId: string,
    ) => {
      return request(app.getHttpServer())
        .get(
          `/api/v1/projects/${projectId}/cost-surfaces/${costSurfaceId}/cost-range`,
        )
        .set('Authorization', `Bearer ${token}`)
        .send();
    },

    ThenCostSurfaceAPIEntityWasProperlySaved: async (name: string) => {
      const savedCostSurface = await costSurfaceRepo.findOne({
        where: { name },
      });
      expect(savedCostSurface).toBeDefined();
      expect(savedCostSurface?.name).toEqual(name);
    },

    ThenResponseHasCostSurface: async (
      response: request.Response,
      costSurface: CostSurface,
    ) => {
      const jsonAPICostSurfaces = response.body.data;

      expect(costSurface.id).toEqual(jsonAPICostSurfaces.id);
      expect(costSurface.name).toEqual(jsonAPICostSurfaces.attributes.name);
      expect(costSurface.scenarioUsageCount).toEqual(
        jsonAPICostSurfaces.attributes.scenarioUsageCount,
      );
      expect(jsonAPICostSurfaces.attributes.scenarioUsageCount).toEqual(
        jsonAPICostSurfaces.relationships.scenarios.data.length,
      );
      expect(costSurface.scenarios.length).toEqual(
        jsonAPICostSurfaces.relationships.scenarios.data.length,
      );
    },
    ThenReponseHasCostSurfaceList: async (
      response: request.Response,
      costSurfaces: CostSurface[],
    ) => {
      const jsonAPICostSurfaces = response.body.data;
      const expected = costSurfaces.sort((a, b) => b.id.localeCompare(a.id));
      const received = jsonAPICostSurfaces.sort((a: any, b: any) =>
        b.id.localeCompare(a.id),
      );

      expect(expected.length).toEqual(received.length);
      for (let i = 0; i < expected.length; i++) {
        expect(expected[i].id).toEqual(received[i].id);
        expect(expected[i].name).toEqual(received[i].attributes.name);
        expect(expected[i].scenarioUsageCount).toEqual(
          received[i].attributes.scenarioUsageCount,
        );
        expect(received[i].attributes.scenarioUsageCount).toEqual(
          received[i].relationships.scenarios.data.length,
        );
        expect(expected[i].scenarios.length).toEqual(
          received[i].relationships.scenarios.data.length,
        );
      }
    },

    ThenCostSurfaceAPIEntityWasProperlyUpdated: async (
      response: request.Response,
      name: string,
    ) => {
      const jsonAPICostSurface: JSONAPICostSurface = response.body.data;
      const savedCostSurface = await costSurfaceRepo.findOneOrFail({
        where: { id: jsonAPICostSurface.id },
      });
      expect(savedCostSurface.name).toEqual(name);
      expect(savedCostSurface.name).toEqual(jsonAPICostSurface.attributes.name);
    },

    ThenCostSurfaceAPIEntityWasNotUpdated: async (costSurface: CostSurface) => {
      const savedCostSurface = await costSurfaceRepo.findOneOrFail({
        where: { id: costSurface.id },
      });
      expect(savedCostSurface).toBeDefined();
      expect(savedCostSurface.name).toEqual(costSurface.name);
      expect(savedCostSurface.min).toEqual(costSurface.min);
      expect(savedCostSurface.max).toEqual(costSurface.max);
    },

    ThenProjectNotViewableErrorWasReturned: (response: request.Response) => {
      const error: any = response.body.errors[0].title;
      expect(response.status).toBe(HttpStatus.FORBIDDEN);
      expect(error).toContain(
        `User with ID: ${userId} is not allowed to perform this action on costSurfaces.`,
      );
    },
    ThenProjectNotEditableErrorWasReturned: (
      response: request.Response,
      projectId: string,
    ) => {
      const error: any = response.body.errors[0].title;
      expect(response.status).toBe(HttpStatus.FORBIDDEN);
      expect(error).toContain(
        `Project with id ${projectId} is not editable by user ${userId}`,
      );
    },
    ThenCostSurfaceWasNotCreated: async (costSurfaceName: string) => {
      const costSurface = await costSurfaceRepo.findOne({
        where: { name: costSurfaceName },
      });

      expect(costSurface).toBeNull();
    },
    ThenCostSurfaceWasDeleted: async (costSurfaceId: string) => {
      const costSurface = await costSurfaceRepo.findOne({
        where: { id: costSurfaceId },
      });
      expect(costSurface).toBeNull();
    },
    ThenCostSurfaceWasNotDeleted: async (costSurfaceId: string) => {
      const costSurface = await costSurfaceRepo.findOne({
        where: { id: costSurfaceId },
      });
      expect(costSurface).not.toBeNull();
    },
    ThenCostSurfaceDeletedEventWasEmitted: async (costSurfaceId: string) => {
      const event = await eventBusTestUtils.waitUntilEventIsPublished(
        CostSurfaceDeleted,
      );

      expect(event).toMatchObject({ costSurfaceId });
    },
    ThenUnusedResourceJobWasSent: async (costSurfaceId: string) => {
      expect(Object.values(unusedResourceCleanupQueue.jobs).length).toBe(1);
      const job = Object.values(unusedResourceCleanupQueue.jobs)[0];
      expect(job.data.type).toEqual('Cost Surface');
      expect(job.data.costSurfaceId).toEqual(costSurfaceId);
    },

    ThenEmptyErrorWasReturned: (response: request.Response) => {
      const error: any =
        response.body.errors[0].meta.rawError.response.message[0];
      expect(error).toContain(`name should not be empty`);
    },
    ThenNotFoundErrorWasReturned: (
      response: request.Response,
      projectId: string,
    ) => {
      const error: any = response.body.errors[0].meta.rawError.response.message;
      expect(error).toContain(
        `Cost Surface for Project with id ${projectId} not found`,
      );
    },

    ThenNameAlreadyExistsErrorWasReturned: (
      response: request.Response,
      costSurfaceId: string,
    ) => {
      const error: any = response.body.errors[0].meta.rawError.response.message;
      expect(response.status).toBe(HttpStatus.FORBIDDEN);
      expect(error).toContain(
        `Cost Surface with id ${costSurfaceId} cannot be updated: name is already in use in the associated Project`,
      );
    },
    ThenADefaultCostSurfaceWasCreated: async (projectId: string) => {
      const costSurface = await costSurfaceRepo.findOne({
        where: { projectId, name: 'default', isDefault: true },
      });

      expect(costSurface).toBeDefined();
    },
    ThenCostSurfaceStillInUseErrorWasReturned: (
      response: request.Response,
      costSurfaceId: string,
    ) => {
      const error: any = response.body.errors[0].meta.rawError.response.message;
      expect(response.status).toBe(HttpStatus.FORBIDDEN);
      expect(error).toContain(
        `Cost Surface with id ${costSurfaceId} cannot be deleted: it's still in use by Scenarios`,
      );
    },
    ThenCostSurfaceDefaultCannotBeDeletedErrorWasReturned: (
      response: request.Response,
      costSurfaceId: string,
    ) => {
      const error: any = response.body.errors[0].meta.rawError.response.message;
      expect(response.status).toBe(HttpStatus.FORBIDDEN);
      expect(error).toContain(
        `Cost Surface with id ${costSurfaceId} cannot be deleted: it's the Project's default`,
      );
    },

    ThenCostSurfaceRangeWasReturned: async (response: any) => {
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toEqual({ min: 0, max: 0 });
    },
  };
};
