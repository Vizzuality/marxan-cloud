import { GeoFeature } from '@marxan-api/modules/geo-features/geo-feature.api.entity';
import { PuvsprCalculationsService } from '@marxan/puvspr-calculations';
import { Injectable } from '@nestjs/common';
import { FeatureAmountPerPlanningUnitId, PuvsprDat } from './puvsrpr.dat';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

@Injectable()
export class PuvsprDatLegacyProject implements PuvsprDat {
  constructor(
    private readonly puvsprCalculations: PuvsprCalculationsService,
    @InjectRepository(GeoFeature)
    private readonly featuresRepo: Repository<GeoFeature>,
  ) {}
  public async getAmountPerPlanningUnitAndFeature(
    projectId: string,
    scenarioId: string,
    featureIds: string[],
  ): Promise<FeatureAmountPerPlanningUnitId[]> {
    const {
      legacyFeatureIds,
      marxanFeatureIds,
    } = await this.getLegacyAndMarxanFeatures(featureIds);

    const legacyFeaturesComputed = await this.computeLegacyFeatures(
      legacyFeatureIds,
      scenarioId,
    );

    const marxanFeaturesComputed = await this.computeMarxanFeatures(
      marxanFeatureIds,
      scenarioId,
    );

    return legacyFeaturesComputed.concat(marxanFeaturesComputed);
  }

  private async getLegacyAndMarxanFeatures(featureIds: string[]) {
    if (!featureIds.length)
      return { legacyFeatureIds: [], marxanFeatureIds: [] };

    const features = await this.featuresRepo.find({
      where: { id: In(featureIds) },
    });

    const legacyFeatureIds = features
      .filter(({ isLegacy }) => isLegacy)
      .map(({ id }) => id);
    const marxanFeatureIds = features
      .filter(({ isLegacy }) => !isLegacy)
      .map(({ id }) => id);

    return { legacyFeatureIds, marxanFeatureIds };
  }

  private async computeLegacyFeatures(
    featureIds: string[],
    scenarioId: string,
  ): Promise<FeatureAmountPerPlanningUnitId[]> {
    const legacyFeaturesComputations = await Promise.all(
      featureIds.map((featureId) =>
        this.puvsprCalculations.computeLegacyAmountPerPlanningUnit(
          featureId,
          scenarioId,
        ),
      ),
    );
    return legacyFeaturesComputations.flatMap((legacyFeatureComputed) => {
      return legacyFeatureComputed.map(({ amount, featureId, puId }) => {
        return { amount, featureId, puId };
      });
    });
  }

  private async computeMarxanFeatures(
    featureIds: string[],
    scenarioId: string,
  ): Promise<FeatureAmountPerPlanningUnitId[]> {
    const marxanFeaturesComputations = await Promise.all(
      featureIds.map((featureId) =>
        this.puvsprCalculations.computeMarxanAmountPerPlanningUnit(
          featureId,
          scenarioId,
        ),
      ),
    );
    return marxanFeaturesComputations.flatMap((marxanFeatureComputed) => {
      return marxanFeatureComputed.map(({ amount, featureId, puId }) => {
        return { amount, featureId, puId };
      });
    });
  }
}
