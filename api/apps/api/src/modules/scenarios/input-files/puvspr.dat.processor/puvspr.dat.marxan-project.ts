import { DbConnections } from '@marxan-api/ormconfig.connections';
import { ProjectsPuEntity } from '@marxan-jobs/planning-unit-geometry';
import { PuvsprCalculationsRepository } from '@marxan/puvspr-calculations';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeatureAmountPerPlanningUnitId, PuvsprDat } from './puvsrpr.dat';

@Injectable()
export class PuvsprDatMarxanProject implements PuvsprDat {
  constructor(
    private readonly puvsprCalculationsRepo: PuvsprCalculationsRepository,
    @InjectRepository(ProjectsPuEntity, DbConnections.geoprocessingDB)
    private readonly projectsPusRepo: Repository<ProjectsPuEntity>,
  ) {}
  public async getAmountPerPlanningUnitAndFeature(
    projectId: string,
    scenarioId: string,
    featureIds: string[],
  ): Promise<FeatureAmountPerPlanningUnitId[]> {
    const amountPerPlanningUnitOfFeature = await this.puvsprCalculationsRepo.getAmountPerPlanningUnitAndFeature(
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
