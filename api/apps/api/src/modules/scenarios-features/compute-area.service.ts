import { ProjectSourcesEnum } from '@marxan/projects';
import {
  FeatureAmountsPerPlanningUnitRepository,
  FeatureAmountsPerPlanningUnitService,
} from '@marxan/feature-amounts-per-planning-unit';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../projects/project.api.entity';
import { GeoFeaturesService } from '@marxan-api/modules/geo-features';
import { GeoFeature } from '@marxan-api/modules/geo-features/geo-feature.api.entity';

@Injectable()
export class ComputeArea {
  constructor(
    private readonly featureAmountsPerPlanningUnitRepo: FeatureAmountsPerPlanningUnitRepository,
    private readonly featureAmountsPerPlanningUnit: FeatureAmountsPerPlanningUnitService,
    @InjectRepository(Project)
    private readonly projectsRepo: Repository<Project>,
    @InjectRepository(GeoFeature)
    private readonly geoFeatureRepo: Repository<GeoFeature>,
    private readonly geoFeatureService: GeoFeaturesService,
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

    if (!alreadyComputed) {
      const amountPerPlanningUnitOfFeature =
        await this.featureAmountsPerPlanningUnit.computeMarxanAmountPerPlanningUnit(
          featureId,
          projectId,
        );

      await this.featureAmountsPerPlanningUnitRepo.saveAmountPerPlanningUnitAndFeature(
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

    const minMaxAlreadyComputed = await this.areFeatureMinMaxSaved(featureId);

    if (!minMaxAlreadyComputed) {
      await this.geoFeatureService.saveAmountRangeForFeatures([featureId]);
    }
  }

  private async areFeatureMinMaxSaved(featureId: string): Promise<boolean> {
    const feature = await this.geoFeatureRepo.findOneOrFail({
      where: { id: featureId },
    });
    return !!(feature.amountMin && feature.amountMax);
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
