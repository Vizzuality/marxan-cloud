import { DbConnections } from '@marxan-api/ormconfig.connections';
import { ProjectsPuEntity } from '@marxan-jobs/planning-unit-geometry';
import { FeatureAmountsPerPlanningUnitRepository } from '@marxan/feature-amounts-per-planning-unit';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export type FeatureAmountPerPlanningUnitId = {
  featureId: string;
  amount: number;
  puId: number;
};

@Injectable()
export class PuvsprDatFeatureAmountsService {
  constructor(
    private readonly featureAmountsPerPlanningUnitRepo: FeatureAmountsPerPlanningUnitRepository,
    @InjectRepository(ProjectsPuEntity, DbConnections.geoprocessingDB)
    private readonly projectsPusRepo: Repository<ProjectsPuEntity>,
  ) {}
  public async getAmountPerPlanningUnitAndFeature(
    projectId: string,
    featureIds: string[],
  ): Promise<FeatureAmountPerPlanningUnitId[]> {
    const amountPerPlanningUnitOfFeature =
      await this.featureAmountsPerPlanningUnitRepo.getAmountPerPlanningUnitAndFeature(
        projectId,
        featureIds,
      );

    const projectPusById = await this.getProjectPlanningUnitsById(projectId);

    return amountPerPlanningUnitOfFeature.map(
      ({ amount, featureId, projectPuId }) => ({
        amount,
        featureId,
        puId: projectPusById[projectPuId],
      }),
    );
  }

  private async getProjectPlanningUnitsById(projectId: string) {
    const projectPus: {
      id: string;
      puId: number;
    }[] = await this.projectsPusRepo
      .createQueryBuilder()
      .select('id')
      .addSelect('puid', 'puId')
      .where('project_id = :projectId', { projectId })
      .execute();

    const projectPusById: Record<string, number> = {};
    projectPus.reduce((prev, { id, puId }) => {
      prev[id] = puId;
      return prev;
    }, projectPusById);

    return projectPusById;
  }
}
