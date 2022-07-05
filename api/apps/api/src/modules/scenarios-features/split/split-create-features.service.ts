import { GeoFeature } from '@marxan-api/modules/geo-features/geo-feature.api.entity';
import { JobStatus } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { SplitFeatureConfigMapper } from '@marxan-api/modules/scenarios/specification/split-feature-config.mapper';
import { FeatureConfigSplit } from '@marxan-api/modules/specification';
import { FeatureTag } from '@marxan/features';
import {
  SingleConfigFeatureValueHasher,
  SingleSplitConfigFeatureValue,
  SingleSplitConfigFeatureValueStripped,
} from '@marxan/features-hash';
import { isDefined } from '@marxan/utils';
import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';

type SelectFeaturesByHashResult = {
  id: string;
  hash: string;
};

type HashCanonicalAndSingleSplitConfigFeature = {
  hash: string;
  canonical: SingleSplitConfigFeatureValueStripped;
  singleSplitFeature: SingleSplitConfigFeatureValue;
};

type SingleSplitConfigFeatureValueWithId = {
  id: string;
  singleSplitFeature: SingleSplitConfigFeatureValue;
};

@Injectable()
export class SplitCreateFeatures {
  constructor(
    @InjectEntityManager()
    private readonly apiEntityManager: EntityManager,
    private readonly splitFeatureConfigMapper: SplitFeatureConfigMapper,
    private readonly splitConfigHasher: SingleConfigFeatureValueHasher,
  ) {}
  public async createSplitFeatures(
    input: FeatureConfigSplit,
    projectId: string,
  ) {
    const singleSplitFeatures = this.splitFeatureConfigMapper.toSingleSplitFeatureConfig(
      input,
    );

    const singleSplitFeaturesWithHashes = await this.getSplitConfigFeaturesWithHashes(
      singleSplitFeatures,
    );

    const {
      createdFeatures,
      notCreatedFeatues,
    } = await this.getCreatedAndNotCreatedFeatures(
      singleSplitFeaturesWithHashes,
    );

    const newFeaturesCreated = await this.createFeatures(
      notCreatedFeatues,
      projectId,
    );

    return createdFeatures.concat(newFeaturesCreated);
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

  private async getCreatedAndNotCreatedFeatures(
    singleSplitFeaturesWithHashes: HashCanonicalAndSingleSplitConfigFeature[],
  ) {
    if (!singleSplitFeaturesWithHashes.length)
      return { notCreatedFeatues: [], createdFeatures: [] };

    const hashes = singleSplitFeaturesWithHashes.map(({ hash }) => hash);

    const featuresWithHashesFound: SelectFeaturesByHashResult[] = await this.apiEntityManager
      .createQueryBuilder()
      .select('id')
      .addSelect('geoprocessing_ops_hash', 'hash')
      .from(GeoFeature, 'features')
      .where('geoprocessing_ops_hash IN (:...hashes)', { hashes })
      .execute();

    if (!featuresWithHashesFound.length)
      return {
        notCreatedFeatues: singleSplitFeaturesWithHashes,
        createdFeatures: [],
      };

    const featureIdByHash: Record<string, string> = this.getFeatureIdByHash(
      featuresWithHashesFound,
    );

    const notCreatedFeatues = singleSplitFeaturesWithHashes.filter(
      ({ hash }) => !featureIdByHash[hash],
    );

    const createdFeatures = singleSplitFeaturesWithHashes
      .filter(({ hash }) => isDefined(featureIdByHash[hash]))
      .map(({ singleSplitFeature, hash }) => {
        return { id: featureIdByHash[hash], singleSplitFeature };
      });

    return { notCreatedFeatues, createdFeatures };
  }

  private getFeatureIdByHash(
    featuresWithHashesFound: SelectFeaturesByHashResult[],
  ) {
    const featureIdByHash: Record<string, string> = {};

    featuresWithHashesFound.reduce((prev, { hash, id }) => {
      prev[hash] = id;
      return prev;
    }, featureIdByHash);

    return featureIdByHash;
  }

  private async createFeatures(
    nonExistingFeatures: HashCanonicalAndSingleSplitConfigFeature[],
    projectId: string,
  ) {
    const res: SingleSplitConfigFeatureValueWithId[] = [];
    const insertValues = nonExistingFeatures.map(
      ({ canonical, singleSplitFeature }) => {
        const featureName =
          `feature/${canonical.baseFeatureId}/${canonical.splitByProperty}` +
          `${canonical.value ?? ''}`;
        const featureId = v4();

        res.push({ id: featureId, singleSplitFeature });

        return {
          id: featureId,
          project_id: projectId,
          feature_class_name: featureName,
          tag: FeatureTag.Species,
          creation_status: JobStatus.created,
          from_geoprocessing_ops: canonical,
        };
      },
    );

    await this.apiEntityManager
      .createQueryBuilder()
      .insert()
      .into(GeoFeature)
      .values(insertValues)
      .execute();

    return res;
  }
}
