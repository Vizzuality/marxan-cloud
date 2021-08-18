import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { assertDefined } from '@marxan/utils';
import { ProjectsCrudService } from '@marxan-api/modules/projects/projects-crud.service';
import { FeatureConfigSplit } from '@marxan-api/modules/specification';
import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { CreateFeaturesCommand } from '../create-features.command';

export class SplitDataProvider {
  constructor(
    @InjectEntityManager()
    private readonly apiEntityManager: EntityManager,
    private readonly projects: ProjectsCrudService,
  ) {}

  async prepareData(
    command: CreateFeaturesCommand & { input: FeatureConfigSplit },
  ) {
    const scenario = await this.apiEntityManager
      .getRepository(Scenario)
      .findOne(command.scenarioId, {
        relations: ['project'],
      });
    assertDefined(scenario);
    const { project } = scenario;
    assertDefined(project);
    const input = command.input;

    const protectedAreaFilterByIds = scenario.protectedAreaFilterByIds ?? [];

    const planningAreaLocation = await this.projects.locatePlanningAreaEntity({
      adminAreaLevel1Id: project.adminAreaLevel1Id,
      adminAreaLevel2Id: project.adminAreaLevel2Id,
      countryId: project.countryId,
      planningAreaGeometryId: project.planningAreaGeometryId,
    });
    return { project, input, protectedAreaFilterByIds, planningAreaLocation };
  }
}
