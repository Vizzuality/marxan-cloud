import { GeoFeature } from '@marxan-api/modules/geo-features/geo-feature.api.entity';
import { JobStatus } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { SplitFeatureConfigMapper } from '@marxan-api/modules/scenarios/specification/split-feature-config.mapper';
import { FeatureConfigSplit } from '@marxan-api/modules/specification';
import { isDefined } from '@marxan/utils';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { v4 } from 'uuid';
import { SingleConfigFeatureValueHasher } from '@marxan-api/modules/features-hash/single-config-feature-value.hasher';
import {
  SingleSplitConfigFeatureValue,
  SingleSplitConfigFeatureValueStripped,
} from '@marxan/features-hash';
import { isLeft, left, right } from 'fp-ts/lib/Either';

type HashCanonicalAndSingleSplitConfigFeature = {
  hash: string;
  canonical: SingleSplitConfigFeatureValueStripped;
  singleSplitFeature: SingleSplitConfigFeatureValue;
};

export type SingleSplitConfigFeatureValueWithId = {
  id: string;
  singleSplitFeature: SingleSplitConfigFeatureValue;
};

export const baseFeatureIsDerived = Symbol('base feature is derived');

@Injectable()
export class SplitCreateFeatures {
  constructor(
    @InjectRepository(GeoFeature)
    private readonly featuresRepo: Repository<GeoFeature>,
    private readonly splitFeatureConfigMapper: SplitFeatureConfigMapper,
    private readonly splitConfigHasher: SingleConfigFeatureValueHasher,
  ) {}
  public async createSplitFeatures(
    input: FeatureConfigSplit,
    projectId: string,
  ): Promise<SingleSplitConfigFeatureValueWithId[]> {
    const baseFeatureOrError = await this.isBaseFeatureADerivedFeature(input);

    if (isLeft(baseFeatureOrError))
      throw new Error('trying to split an already derived feature');

    const baseFeature = baseFeatureOrError.right;

    const singleSplitFeatures = this.splitFeatureConfigMapper.toSingleSplitFeatureConfig(
      input,
    );

    const singleSplitFeaturesWithHashes = await this.getSplitConfigFeaturesWithHashes(
      singleSplitFeatures,
    );

    const {
      featuresAlreadyExisting,
      featuresToBeCreated,
    } = await this.checkIfFeaturesMatchingGivenHashesInProjectExist(
      singleSplitFeaturesWithHashes,
      projectId,
    );

    const newFeaturesCreated = await this.createFeatures(
      featuresToBeCreated,
      baseFeature,
      projectId,
    );

    return featuresAlreadyExisting.concat(newFeaturesCreated);
  }

  private async isBaseFeatureADerivedFeature(input: FeatureConfigSplit) {
    const baseFeature = await this.getBaseFeature(input.baseFeatureId);

    return isDefined(baseFeature.geoprocessingOpsHash)
      ? left(baseFeatureIsDerived)
      : right(baseFeature);
  }

  private async getBaseFeature(baseFeatureId: string) {
    const [feature] = await this.featuresRepo.find({
      where: { id: baseFeatureId },
    });

    if (!feature) throw new Error('did not find base feature');

    return feature;
  }

  private async getSplitConfigFeaturesWithHashes(
    singleSplitFeatures: SingleSplitConfigFeatureValue[],
  ): Promise<HashCanonicalAndSingleSplitConfigFeature[]> {
    return Promise.all(
      singleSplitFeatures.map((singleSplitFeature) =>
        this.getHashAndStripped(singleSplitFeature),
      ),
    );
  }

  private async getHashAndStripped(
    singleSplitFeature: SingleSplitConfigFeatureValue,
  ) {
    const hashAndStrippedFeature = await this.splitConfigHasher.getHashAndStrippedConfigFeature(
      singleSplitFeature,
    );

    return { singleSplitFeature, ...hashAndStrippedFeature };
  }

  private async checkIfFeaturesMatchingGivenHashesInProjectExist(
    singleSplitFeaturesWithHashes: HashCanonicalAndSingleSplitConfigFeature[],
    projectId: string,
  ) {
    if (!singleSplitFeaturesWithHashes.length)
      return { featuresToBeCreated: [], featuresAlreadyExisting: [] };

    const hashes = singleSplitFeaturesWithHashes.map(({ hash }) => hash);

    const featuresWithHashesFoundInProject = await this.featuresRepo.find({
      where: { geoprocessingOpsHash: In(hashes), projectId },
    });

    if (!featuresWithHashesFoundInProject.length)
      return {
        featuresToBeCreated: singleSplitFeaturesWithHashes,
        featuresAlreadyExisting: [],
      };

    const featureIdByHash: Record<string, string> = this.getFeatureIdByHash(
      featuresWithHashesFoundInProject,
    );

    const featuresToBeCreated = singleSplitFeaturesWithHashes.filter(
      ({ hash }) => !featureIdByHash[hash],
    );

    const featuresAlreadyExisting = singleSplitFeaturesWithHashes
      .filter(({ hash }) => isDefined(featureIdByHash[hash]))
      .map(({ singleSplitFeature, hash }) => {
        return { id: featureIdByHash[hash], singleSplitFeature };
      });

    return { featuresToBeCreated, featuresAlreadyExisting };
  }

  private getFeatureIdByHash(featuresWithHashesFound: GeoFeature[]) {
    const featureIdByHash: Record<string, string> = {};

    featuresWithHashesFound.reduce((prev, { geoprocessingOpsHash, id }) => {
      if (!geoprocessingOpsHash) return prev;

      prev[geoprocessingOpsHash] = id;
      return prev;
    }, featureIdByHash);

    return featureIdByHash;
  }

  private async createFeatures(
    nonExistingFeatures: HashCanonicalAndSingleSplitConfigFeature[],
    baseFeature: GeoFeature,
    projectId: string,
  ) {
    const res: SingleSplitConfigFeatureValueWithId[] = [];
    const features = nonExistingFeatures.map(
      ({ canonical, singleSplitFeature }) => {
        const valueChain = canonical.value ? `: ${canonical.value}` : '';
        const featureName =
          `${baseFeature.featureClassName} / ${canonical.splitByProperty}` +
          valueChain;

        const featureId = v4();
        res.push({ id: featureId, singleSplitFeature });

        return {
          id: featureId,
          projectId,
          featureClassName: featureName,
          creationStatus: JobStatus.created,
          fromGeoprocessingOps: canonical,
        };
      },
    );

    await Promise.all(
      features.map((feature) => {
        return this.featuresRepo.save(feature);
      }),
    );

    return res;
  }
}
