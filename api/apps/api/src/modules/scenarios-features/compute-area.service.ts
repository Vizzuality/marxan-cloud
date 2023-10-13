import { ProjectSourcesEnum } from '@marxan/projects';
import {
  PuvsprCalculationsRepository,
  PuvsprCalculationsService,
} from '@marxan/puvspr-calculations';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../projects/project.api.entity';

@Injectable()
export class ComputeArea {
  constructor(
    private readonly puvsprCalculationsRepo: PuvsprCalculationsRepository,
    private readonly puvsprCalculations: PuvsprCalculationsService,
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
      await this.puvsprCalculationsRepo.areAmountPerPlanningUnitAndFeatureSaved(
        projectId,
        featureId,
      );

    if (alreadyComputed) return;

    const amountPerPlanningUnitOfFeature =
      await this.puvsprCalculations.computeMarxanAmountPerPlanningUnit(
        featureId,
        scenarioId,
      );

    return this.puvsprCalculationsRepo.saveAmountPerPlanningUnitAndFeature(
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
