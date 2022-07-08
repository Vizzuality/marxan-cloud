import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ProjectsPuEntity } from '@marxan-jobs/planning-unit-geometry';
import { ResourceKind } from '@marxan/cloning/domain';
import { GeoFeatureGeometry } from '@marxan/geofeatures';
import { PlanningArea } from '@marxan/planning-area-repository/planning-area.geo.entity';
import { ProtectedArea } from '@marxan/protected-areas';
import { UnusedResources } from '@marxan/unused-resources-cleanup';
import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';

type ProjectUnusedResourcesData = { projectCustomFeaturesIds: string[] };

@Injectable()
export class ProjectUnusedResources
  implements UnusedResources<ProjectUnusedResourcesData> {
  constructor(
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly apiEntityManager: EntityManager,
    @InjectRepository(PlanningArea)
    private readonly planningAreasRepo: Repository<PlanningArea>,
    @InjectRepository(ProtectedArea)
    private readonly protectedAreasRepo: Repository<ProtectedArea>,
    @InjectRepository(GeoFeatureGeometry)
    private readonly featuresDataRepo: Repository<GeoFeatureGeometry>,
    @InjectRepository(ProjectsPuEntity)
    private readonly projectsPuRepo: Repository<ProjectsPuEntity>,
  ) {}
  async removeUnusedResources(
    projectId: string,
    data: ProjectUnusedResourcesData,
  ): Promise<void> {
    await this.apiEntityManager
      .createQueryBuilder()
      .delete()
      .from('exports')
      .where('resource_kind = :kind', { kind: ResourceKind.Project })
      .andWhere('resource_id = :projectId', { projectId })
      .execute();

    await this.apiEntityManager
      .createQueryBuilder()
      .delete()
      .from('imports')
      .where('resource_kind = :kind', { kind: ResourceKind.Project })
      .andWhere('resource_id = :projectId', { projectId })
      .execute();

    await this.planningAreasRepo.delete({ projectId });
    await this.protectedAreasRepo.delete({ projectId });
    await this.featuresDataRepo.delete({
      featureId: In(data.projectCustomFeaturesIds),
    });

    await this.projectsPuRepo.delete({ projectId });
  }
}
