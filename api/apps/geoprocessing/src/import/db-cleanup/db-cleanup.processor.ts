import { ProjectsPuEntity } from '@marxan-jobs/planning-unit-geometry';
import { BlmFinalResultEntity } from '@marxan/blm-calibration';
import { ResourceKind } from '@marxan/cloning/domain';
import { FailedImportDbCleanupJobInput } from '@marxan/cloning/job-input';
import { FailedImportDbCleanupJobOutput } from '@marxan/cloning/job-output';
import { ScenarioFeaturesData } from '@marxan/features';
import { GeoFeatureGeometry } from '@marxan/geofeatures';
import { OutputScenariosPuDataGeoEntity } from '@marxan/marxan-output';
import { PlanningArea } from '@marxan/planning-area-repository/planning-area.geo.entity';
import { ProtectedArea } from '@marxan/protected-areas';
import { ScenariosPuPaDataGeo } from '@marxan/scenarios-planning-unit';
import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { geoprocessingConnections } from '../../ormconfig';

@Injectable()
export class DbCleanupProcessor {
  #dbCleaners: Record<ResourceKind, (resourceId: string) => Promise<void>> = {
    [ResourceKind.Project]: (projectId) => this.cleanProjectImport(projectId),
    [ResourceKind.Scenario]: (scenarioId) =>
      this.cleanScenarioImport(scenarioId),
  };

  constructor(
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly apiEntityManager: EntityManager,
    @InjectRepository(ProjectsPuEntity)
    private readonly projectsPuRepo: Repository<ProjectsPuEntity>,
    @InjectRepository(BlmFinalResultEntity)
    private readonly blmFinalResultRepo: Repository<BlmFinalResultEntity>,
    @InjectRepository(ScenariosPuPaDataGeo)
    private readonly scenariosPuDataRepo: Repository<ScenariosPuPaDataGeo>,
    @InjectRepository(OutputScenariosPuDataGeoEntity)
    private readonly outputScenariosPuDataRepo: Repository<OutputScenariosPuDataGeoEntity>,
    @InjectRepository(PlanningArea)
    private readonly planningAreasRepo: Repository<PlanningArea>,
    @InjectRepository(ProtectedArea)
    private readonly protectedAreasRepo: Repository<ProtectedArea>,
    @InjectRepository(GeoFeatureGeometry)
    private readonly featuresDataRepo: Repository<GeoFeatureGeometry>,
    @InjectRepository(ScenarioFeaturesData)
    private readonly scenarioFeaturesDataRepo: Repository<ScenarioFeaturesData>,
  ) {}

  private async cleanScenarioImport(scenarioId: string) {
    const apiQb = this.apiEntityManager.createQueryBuilder();

    await apiQb
      .delete()
      .from('scenarios')
      .where('id = :scenarioId', { scenarioId })
      .execute();

    await this.blmFinalResultRepo.delete({ scenarioId });

    const scenarioPuData = await this.scenariosPuDataRepo.find({
      where: { scenarioId },
    });

    await this.outputScenariosPuDataRepo.delete({
      scenarioPuId: In(scenarioPuData.map((pu) => pu.id)),
    });

    await this.scenarioFeaturesDataRepo.delete({
      scenarioId,
    });

    await this.scenariosPuDataRepo.delete({ scenarioId });
  }

  private async cleanProjectImport(projectId: string) {
    const scenarios: { id: string }[] = await this.apiEntityManager
      .createQueryBuilder()
      .select('id')
      .from('scenarios', 's')
      .where('project_id = :projectId', {
        projectId,
      })
      .execute();
    const scenarioIds = scenarios.map((scenario) => scenario.id);
    const projectHasScenarios = scenarioIds.length > 0;

    const projectCustomFeatures: {
      id: string;
    }[] = await this.apiEntityManager
      .createQueryBuilder()
      .select('id')
      .from('features', 'f')
      .where('project_id = :projectId', { projectId })
      .execute();

    await this.apiEntityManager
      .createQueryBuilder()
      .delete()
      .from('projects')
      .where('id = :projectId', { projectId })
      .execute();

    await this.planningAreasRepo.delete({ projectId });
    await this.protectedAreasRepo.delete({ projectId });
    await this.featuresDataRepo.delete({
      featureId: In(projectCustomFeatures.map((feature) => feature.id)),
    });

    if (projectHasScenarios) {
      await this.blmFinalResultRepo.delete({ scenarioId: In(scenarioIds) });

      const scenariosPuData = await this.scenariosPuDataRepo.find({
        where: { scenarioId: In(scenarioIds) },
      });

      await this.outputScenariosPuDataRepo.delete({
        scenarioPuId: In(scenariosPuData.map((pu) => pu.id)),
      });

      await this.scenarioFeaturesDataRepo.delete({
        scenarioId: In(scenarioIds),
      });
    }

    await this.projectsPuRepo.delete({ projectId });
  }

  async run(
    input: FailedImportDbCleanupJobInput,
  ): Promise<FailedImportDbCleanupJobOutput> {
    await this.#dbCleaners[input.resourceKind](input.resourceId);
    return input;
  }
}
