import { ProjectsPuEntity } from '@marxan-jobs/planning-unit-geometry';
import { GeoFeatureGeometry } from '@marxan/geofeatures';
import {
  FailedLegacyProjectImportDbCleanupJobInput,
  FailedLegacyProjectImportDbCleanupJobOutput,
} from '@marxan/legacy-project-import';
import { OutputScenariosPuDataGeoEntity } from '@marxan/marxan-output';
import { PlanningArea } from '@marxan/planning-area-repository/planning-area.geo.entity';
import { ScenariosPuPaDataGeo } from '@marxan/scenarios-planning-unit';
import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { geoprocessingConnections } from '../../ormconfig';

@Injectable()
export class LegacyDbCleanupProcessor {
  constructor(
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly apiEntityManager: EntityManager,
    @InjectRepository(ProjectsPuEntity)
    private readonly projectsPuRepo: Repository<ProjectsPuEntity>,
    @InjectRepository(ScenariosPuPaDataGeo)
    private readonly scenariosPuDataRepo: Repository<ScenariosPuPaDataGeo>,
    @InjectRepository(OutputScenariosPuDataGeoEntity)
    private readonly outputScenariosPuDataRepo: Repository<OutputScenariosPuDataGeoEntity>,
    @InjectRepository(PlanningArea)
    private readonly planningAreasRepo: Repository<PlanningArea>,
    @InjectRepository(GeoFeatureGeometry)
    private readonly featuresDataRepo: Repository<GeoFeatureGeometry>,
  ) {}

  private async cleanLegacyProjectImport(projectId: string) {
    const scenarios: { id: string }[] = await this.apiEntityManager
      .createQueryBuilder()
      .select('id')
      .from('scenarios', 's')
      .where('project_id = :projectId', {
        projectId,
      })
      .execute();
    const scenarioIds = scenarios.map((scenario) => scenario.id);
    const projectCustomFeatures: {
      id: string;
    }[] = await this.apiEntityManager
      .createQueryBuilder()
      .select('id')
      .from('features', 'f')
      .where('project_id = :projectId', { projectId })
      .execute();
    const scenariosPuData = await this.scenariosPuDataRepo.find({
      where: { scenarioId: In(scenarioIds) },
    });
    await this.apiEntityManager
      .createQueryBuilder()
      .delete()
      .from('projects')
      .where('id = :projectId', { projectId })
      .execute();
    await this.planningAreasRepo.delete({ projectId });
    await this.featuresDataRepo.delete({
      featureId: In(projectCustomFeatures.map((feature) => feature.id)),
    });

    await this.outputScenariosPuDataRepo.delete({
      scenarioPuId: In(scenariosPuData.map((pu) => pu.id)),
    });
    await this.projectsPuRepo.delete({ projectId });
  }

  async run(
    input: FailedLegacyProjectImportDbCleanupJobInput,
  ): Promise<FailedLegacyProjectImportDbCleanupJobOutput> {
    await this.cleanLegacyProjectImport(input.projectId);
    return input;
  }
}
