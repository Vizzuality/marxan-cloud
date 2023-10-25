import { SingleConfigFeatureValueHasher } from '@marxan-api/modules/features-hash/single-config-feature-value.hasher';
import { CreateGeoFeatureSetDTO } from '@marxan-api/modules/geo-features/dto/create.geo-feature-set.dto';
import {
  SpecForGeoFeatureWithGeoprocessing,
  SpecForPlainGeoFeature,
} from '@marxan-api/modules/geo-features/dto/geo-feature-set-specification.dto';
import { GeoFeature } from '@marxan-api/modules/geo-features/geo-feature.api.entity';
import { ScenarioSpecificationRepo } from '@marxan-api/modules/scenario-specification/application/scenario-specification.repo';
import {
  SpecificationFeatureCopy,
  SpecificationFeatureSplit,
} from '@marxan-api/modules/specification/application/specification-input';
import { SpecificationRepository } from '@marxan-api/modules/specification/application/specification.repository';
import { Specification } from '@marxan-api/modules/specification/domain';
import { SingleSplitConfigFeatureValue } from '@marxan/features-hash';
import { FeatureAmountsPerPlanningUnitService } from '@marxan/feature-amounts-per-planning-unit';
import { SpecificationOperation } from '@marxan/specification';
import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { isLeft, left, right } from 'fp-ts/lib/Either';
import { EntityManager } from 'typeorm';
import { GeoFeatureDtoMapper } from '../../specification/geo-feature-dto.mapper';
import { SplitFeatureConfigMapper } from '../../specification/split-feature-config.mapper';
import { PuvsprDatFeatureAmountsService } from '@marxan-api/modules/scenarios/input-files/puvspr.dat.processor/puvspr.dat.feature-amounts.service';

export type PuvrsprDatRow = {
  speciesId: number;
  amount: number;
  puId: number;
};

@Injectable()
export class PuvsprDatProcessor {
  constructor(
    @InjectEntityManager()
    private readonly apiEntityManager: EntityManager,
    private readonly scenarioSpecificationsRepo: ScenarioSpecificationRepo,
    private readonly specificationsRepo: SpecificationRepository,
    private readonly geoFeatureMapper: GeoFeatureDtoMapper,
    private readonly featureAmountsPerPlanningUnitService: FeatureAmountsPerPlanningUnitService,
    private readonly splitConfigHasher: SingleConfigFeatureValueHasher,
    private readonly splitFeatureConfigMapper: SplitFeatureConfigMapper,
    private readonly puvsprFeatureAmounts: PuvsprDatFeatureAmountsService,
  ) {}

  async getPuvsprDatRows(
    scenarioId: string,
    projectId: string,
  ): Promise<PuvrsprDatRow[]> {
    const specificationOrError = await this.getSpecification(scenarioId);

    if (isLeft(specificationOrError)) return [];

    const specification = specificationOrError.right;

    const featuresIds = await this.getFeaturesIds(specification);

    const featuresIdsWithSpeciesId =
      await this.featureAmountsPerPlanningUnitService.computeSpeciesId(
        featuresIds,
        scenarioId,
      );

    const featuresAmountPerPlanningUnit =
      await this.puvsprFeatureAmounts.getAmountPerPlanningUnitAndFeature(
        projectId,
        featuresIds,
      );

    return featuresIdsWithSpeciesId.flatMap(({ featureId, speciesId }) => {
      const amountPerPlanningUnitOfFeature =
        featuresAmountPerPlanningUnit.filter(
          (row) => row.featureId === featureId,
        );

      return amountPerPlanningUnitOfFeature.map(({ amount, puId }) => ({
        speciesId,
        amount,
        puId,
      }));
    });
  }

  private async getSpecification(scenarioId: string) {
    const scenarioSpecification =
      await this.scenarioSpecificationsRepo.find(scenarioId);
    if (!scenarioSpecification) {
      return left(false);
    }

    const activeSpecificationId =
      scenarioSpecification.currentActiveSpecification?.value;

    if (!activeSpecificationId) return left(false);

    const specification = await this.specificationsRepo.getById(
      activeSpecificationId,
    );

    return specification ? right(specification) : left(false);
  }

  private processFeature(
    feature: SpecForPlainGeoFeature | SpecForGeoFeatureWithGeoprocessing,
  ) {
    const res = this.geoFeatureMapper.toFeatureConfig(feature)[0];

    if (res.operation === SpecificationOperation.Copy) return res;

    if (res.operation === SpecificationOperation.Split) return res;

    throw new Error("can't process stratification");
  }

  private async getFeaturesIds(specification: Specification) {
    const featuresSpecification = plainToClass(
      CreateGeoFeatureSetDTO,
      specification.raw,
    );

    const featureConfigs = featuresSpecification.features.map((feature) =>
      this.processFeature(feature),
    );

    const copyFeatureIds = this.getCopyFeatureIds(featureConfigs);

    const splitFeatureIds = await this.getSplitFeatureIds(featureConfigs);

    return copyFeatureIds.concat(splitFeatureIds);
  }

  private getCopyFeatureIds(
    featureConfigs: (SpecificationFeatureCopy | SpecificationFeatureSplit)[],
  ) {
    const copyFeatureConfigs = featureConfigs.filter(
      (config) => config.operation === SpecificationOperation.Copy,
    ) as SpecificationFeatureCopy[];

    return copyFeatureConfigs.map((feature) => feature.baseFeatureId);
  }

  private async getSplitFeatureIds(
    featureConfigs: (SpecificationFeatureCopy | SpecificationFeatureSplit)[],
  ) {
    const splitFeatureConfigs = featureConfigs.filter(
      (config) => config.operation === SpecificationOperation.Split,
    ) as SpecificationFeatureSplit[];

    const singleSplitFeatureConfigValues = splitFeatureConfigs.flatMap(
      (splitFeatureConfig) =>
        this.splitFeatureConfigMapper.toSingleSplitFeatureConfig(
          splitFeatureConfig,
        ),
    );

    const singleSplitFeaturesHashes = await this.getFeaturesHashes(
      singleSplitFeatureConfigValues,
    );

    return this.getFeaturesIdsByHash(singleSplitFeaturesHashes);
  }

  private async getFeaturesHashes(
    singleSplitFeatureConfigValues: SingleSplitConfigFeatureValue[],
  ) {
    const hashAndStrippedConfigFeatures = await Promise.all(
      singleSplitFeatureConfigValues.map((singleSplitFeatureConfigValue) =>
        this.splitConfigHasher.getHashAndStrippedConfigFeature(
          singleSplitFeatureConfigValue,
        ),
      ),
    );

    return hashAndStrippedConfigFeatures.map(({ hash }) => hash);
  }

  private async getFeaturesIdsByHash(hashes: string[]): Promise<string[]> {
    if (!hashes.length) return [];

    const features: {
      id: string;
    }[] = await this.apiEntityManager
      .createQueryBuilder()
      .select('id')
      .from(GeoFeature, 'features')
      .where('geoprocessing_ops_hash IN (:...hashes)', { hashes })
      .execute();

    return features.map((feature) => feature.id);
  }
}
