import { ProjectSourcesEnum } from '@marxan/projects';
import {
  FeatureAmountsPerPlanningUnitRepository,
  FeatureAmountsPerPlanningUnitService,
} from '@marxan/feature-amounts-per-planning-unit';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../projects/project.api.entity';

@Injectable()
export class ComputeArea {
  constructor(
    private readonly featureAmountsPerPlanningUnitRepo: FeatureAmountsPerPlanningUnitRepository,
    private readonly featureAmountsPerPlanningUnit: FeatureAmountsPerPlanningUnitService,
    @InjectRepository(Project)
    private readonly projectsRepo: Repository<Project>,
  ) {}
  public async computeAreaPerPlanningUnitOfFeature(
    projectId: string,
    scenarioId: string,
    featureId: string,
  ) {
    const isLegacyProject = await this.isLegacyProject(projectId);

    if (isLegacyProject) return;

    const alreadyComputed =
      await this.featureAmountsPerPlanningUnitRepo.areAmountPerPlanningUnitAndFeatureSaved(
        projectId,
        featureId,
      );

    if (alreadyComputed) return;

    const amountPerPlanningUnitOfFeature =
      await this.featureAmountsPerPlanningUnit.computeMarxanAmountPerPlanningUnit(
        featureId,
        scenarioId,
      );

    return this.featureAmountsPerPlanningUnitRepo.saveAmountPerPlanningUnitAndFeature(
      projectId,
      amountPerPlanningUnitOfFeature.map(
        ({ featureId, projectPuId, amount }) => ({
          featureId,
          projectPuId,
          amount,
        }),
      ),
    );
  }

  private async isLegacyProject(projectId: string) {
    const [project] = await this.projectsRepo.find({
      where: {
        id: projectId,
      },
    });

    return project.sources === ProjectSourcesEnum.legacyImport;
  }
}
