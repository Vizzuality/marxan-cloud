import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { assertDefined } from '@marxan/utils';
import { ProjectsCrudService } from '@marxan-api/modules/projects/projects-crud.service';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { GeoFeature } from '@marxan-api/modules/geo-features/geo-feature.api.entity';
import { SingleConfigFeatureValueStripped } from '@marxan/features-hash';
import { FeatureConfigCopy } from '@marxan-api/modules/specification';

@Injectable()
export class CopyDataProvider {
  constructor(
    @InjectEntityManager()
    private readonly apiEntityManager: EntityManager,
    private readonly projects: ProjectsCrudService,
  ) {}

  async prepareData(data: {
    scenarioId: string;
    input: FeatureConfigCopy;
  }): Promise<{
    protectedAreaFilterByIds: string[];
    planningAreaLocation: { id: string; tableName: string } | undefined;
    project: Project;
    featureGeoOps: SingleConfigFeatureValueStripped | null;
  }> {
    const scenario = await this.apiEntityManager
      .getRepository(Scenario)
      .findOne({
        where: { id: data.scenarioId },
        relations: { project: true },
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

    const [featureGeoOps]: {
      fromGeoprocessingOps: SingleConfigFeatureValueStripped | null;
    }[] = await this.apiEntityManager
      .createQueryBuilder()
      .select('from_geoprocessing_ops', 'fromGeoprocessingOps')
      .from(GeoFeature, 'features')
      .where('id = :featureId', { featureId: data.input.baseFeatureId })
      .execute();

    return {
      project,
      protectedAreaFilterByIds,
      planningAreaLocation,
      featureGeoOps: featureGeoOps.fromGeoprocessingOps,
    };
  }
}
