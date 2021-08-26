import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { assertDefined } from '@marxan/utils';
import { ProjectsCrudService } from '@marxan-api/modules/projects/projects-crud.service';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';

@Injectable()
export class CopyDataProvider {
  constructor(
    @InjectEntityManager()
    private readonly apiEntityManager: EntityManager,
    private readonly projects: ProjectsCrudService,
  ) {}

  async prepareData(data: {
    scenarioId: string;
  }): Promise<{
    protectedAreaFilterByIds: string[];
    planningAreaLocation: { id: string; tableName: string } | undefined;
    project: Project;
  }> {
    const scenario = await this.apiEntityManager
      .getRepository(Scenario)
      .findOne(data.scenarioId, {
        relations: ['project'],
      });
    assertDefined(scenario);
    const { project } = scenario;
    assertDefined(project);
    const protectedAreaFilterByIds = scenario.protectedAreaFilterByIds ?? [];

    const planningAreaLocation = await this.projects.locatePlanningAreaEntity({
      adminAreaLevel1Id: project.adminAreaLevel1Id,
      adminAreaLevel2Id: project.adminAreaLevel2Id,
      countryId: project.countryId,
      planningAreaGeometryId: project.planningAreaGeometryId,
    });
    return { project, protectedAreaFilterByIds, planningAreaLocation };
  }
}
