import { GeoFeature } from '@marxan-api/modules/geo-features/geo-feature.api.entity';
import { PuvsprCalculationsService } from '@marxan/puvspr-calculations';
import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { PuvsprDat } from './puvsrpr.dat';

@Injectable()
export class PuvsprDatLegacyProject implements PuvsprDat {
  constructor(
    private readonly puvsprCalculations: PuvsprCalculationsService,
    @InjectEntityManager()
    private readonly apiEntityManager: EntityManager,
  ) {}
  public async getAmountPerPlanningUnitAndFeature(
    projectId: string,
    scenarioId: string,
    featureIds: string[],
  ) {
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

    const legacyFeatures: {
      id: string;
    }[] = await this.apiEntityManager
      .createQueryBuilder()
      .select('id')
      .from(GeoFeature, 'features')
      .where('is_legacy = true')
      .andWhere('id IN (:...featureIds)', { featureIds })
      .execute();

    const legacyFeatureIds = legacyFeatures.map(({ id }) => id);
    const marxanFeatureIds = featureIds.filter(
      (id) => !legacyFeatureIds.includes(id),
    );

    return { legacyFeatureIds, marxanFeatureIds };
  }

  private async computeLegacyFeatures(
    featureIds: string[],
    scenarioId: string,
  ) {
    const result = await Promise.all(
      featureIds.map((featureId) =>
        this.puvsprCalculations.computeLegacyAmountPerPlanningUnit(
          featureId,
          scenarioId,
        ),
      ),
    );
    return result.flat();
  }

  private async computeMarxanFeatures(
    featureIds: string[],
    scenarioId: string,
  ) {
    const result = await Promise.all(
      featureIds.map((featureId) =>
        this.puvsprCalculations.computeMarxanAmountPerPlanningUnit(
          featureId,
          scenarioId,
        ),
      ),
    );
    return result.flat();
  }
}
