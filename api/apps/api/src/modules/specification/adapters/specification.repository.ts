import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { DbConnections } from '@marxan-api/ormconfig.connections';

import { FeatureConfigInput, Specification } from '../domain';
import { SpecificationRepository } from '../application/specification.repository';

import { SpecificationApiEntity } from './specification.api.entity';
import { SpecificationFeatureConfigApiEntity } from './specification-feature-config.api.entity';
import { SpecificationFeatureApiEntity } from './specification-feature.api.entity';

@Injectable()
export class DbSpecificationRepository implements SpecificationRepository {
  constructor(
    @InjectRepository(SpecificationApiEntity)
    private readonly specificationRepo: Repository<SpecificationApiEntity>,
    @InjectRepository(SpecificationFeatureConfigApiEntity)
    private readonly specificationFeatureConfigRepo: Repository<SpecificationFeatureConfigApiEntity>,
    @InjectRepository(SpecificationFeatureApiEntity)
    private readonly specificationFeatureRepo: Repository<SpecificationFeatureApiEntity>,
    @InjectEntityManager(DbConnections.default)
    private readonly entityManager: EntityManager,
  ) {}

  async findAllRelatedToFeatureConfig(
    configuration: FeatureConfigInput,
  ): Promise<Specification[]> {
    // seems like nested where does not fully work
    // https://github.com/typeorm/typeorm/issues/2707
    let builder = this.specificationRepo
      .createQueryBuilder('spec')
      .select('spec.id')
      .leftJoin(
        'specification_feature_configs',
        'config',
        'config.specification_id = spec.id',
      )
      .where(`config.base_feature_id = :baseFeatureId`, {
        baseFeatureId: configuration.baseFeatureId,
      })
      .andWhere(`config.operation = :operation`, {
        operation: configuration.operation,
      });

    if (configuration.againstFeatureId) {
      builder = builder.andWhere(
        `config.against_feature_id = :againstFeatureId`,
        {
          againstFeatureId: configuration.againstFeatureId,
        },
      );
    } else {
      builder.andWhere(`config.against_feature_id is null`);
    }
    const specIds = await builder.getRawMany<{
      spec_id: string;
    }>();
    const specifications = await this.specificationRepo.findByIds(
      specIds.map((row) => row.spec_id),
    );

    return specifications.map((specification) =>
      this.#serialize(specification),
    );
  }

  async findAllRelatedToFeatures(features: string[]): Promise<Specification[]> {
    const specIds = await this.specificationRepo
      .createQueryBuilder('spec')
      .select('spec.id')
      .leftJoin(
        `specification_feature_configs`,
        `config`,
        `config.specification_id = spec.id`,
      )
      .leftJoin(
        `specification_features`,
        `features`,
        `config.id = features.specification_feature_config_id`,
      )
      .where(`features.feature_id::text IN(:featureIds)`, {
        featureIds: features.join(','),
      })
      .getRawMany<{
        spec_id: string;
      }>();

    const specifications = await this.specificationRepo.findByIds(
      specIds.map((row) => row.spec_id),
    );

    return specifications.map((specification) =>
      this.#serialize(specification),
    );
  }

  async getById(id: string): Promise<Specification | undefined> {
    const specification = await this.specificationRepo.findOne({
      where: {
        id,
      },
      loadEagerRelations: true,
    });

    if (specification) {
      return this.#serialize(specification);
    }
  }

  async save(specification: Specification): Promise<void> {
    const snapshot = specification.toSnapshot();
    await this.specificationRepo.save(
      this.specificationRepo.create({
        id: snapshot.id,
        draft: snapshot.draft,
        raw: snapshot.raw,
        scenarioId: snapshot.scenarioId,
        specificationFeaturesConfiguration: this.specificationFeatureConfigRepo.create(
          snapshot.config.map((configuration) => ({
            id: configuration.id,
            againstFeatureId: configuration.againstFeatureId,
            baseFeatureId: configuration.baseFeatureId,
            operation: configuration.operation,
            splitByProperty: configuration.splitByProperty,
            selectSubSets: configuration.selectSubSets,
            features: configuration.resultFeatures.map((feature) =>
              this.specificationFeatureRepo.create({
                id: feature.id,
                calculated: feature.calculated,
                featureId: feature.featureId,
              }),
            ),
            featuresDetermined: configuration.featuresDetermined,
            specificationId: snapshot.id,
          })),
        ),
      }),
      {
        chunk: 10000,
      },
    );
    return;
  }

  transaction(
    code: (repo: SpecificationRepository) => Promise<Specification[]>,
  ): Promise<Specification[]> {
    return this.entityManager.transaction((transactionEntityManager) => {
      const transactionalRepository = new DbSpecificationRepository(
        transactionEntityManager.getRepository(SpecificationApiEntity),
        transactionEntityManager.getRepository(
          SpecificationFeatureConfigApiEntity,
        ),
        transactionEntityManager.getRepository(SpecificationFeatureApiEntity),
        transactionEntityManager,
      );
      return code(transactionalRepository);
    });
  }

  async getLastUpdated(ids: string[]): Promise<Specification | undefined> {
    const specs = await this.specificationRepo.findByIds(ids, {
      take: 1,
      order: {
        lastModifiedAt: 'DESC',
      },
    });
    const foundSpec = specs[0];
    return foundSpec && this.#serialize(foundSpec);
  }

  #serialize = (specification: SpecificationApiEntity): Specification => {
    return Specification.from({
      id: specification.id,
      draft: specification.draft,
      raw: specification.raw,
      scenarioId: specification.scenarioId,
      config:
        specification.specificationFeaturesConfiguration?.map(
          (specificationFeature) => ({
            id: specificationFeature.id,
            againstFeatureId:
              specificationFeature.againstFeatureId ?? undefined,
            baseFeatureId: specificationFeature.baseFeatureId,
            operation: specificationFeature.operation,
            featuresDetermined: specificationFeature.featuresDetermined,
            splitByProperty: specificationFeature.splitByProperty ?? undefined,
            selectSubSets: specificationFeature.selectSubSets ?? undefined,
            resultFeatures:
              specificationFeature.features?.map((feature) => ({
                id: feature.id,
                featureId: feature.featureId,
                calculated: feature.calculated,
              })) ?? [],
          }),
        ) ?? [],
    });
  };
}
