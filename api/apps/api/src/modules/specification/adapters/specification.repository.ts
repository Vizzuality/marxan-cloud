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
        'specification_feature_config',
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
        `specification_feature_config`,
        `config`,
        `config.specification_id = spec.id`,
      )
      .leftJoin(
        `specification_feature`,
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
    return;
  }

  async save(specification: Specification): Promise<void> {
    const snapshot = specification.toSnapshot();
    await this.specificationRepo.save(
      this.specificationRepo.create({
        id: snapshot.id,
        draft: snapshot.draft,
        scenarioId: snapshot.scenarioId,
        specificationFeaturesConfiguration: this.specificationFeatureConfigRepo.create(
          snapshot.config.map((configuration) => ({
            againstFeatureId: configuration.againstFeatureId,
            baseFeatureId: configuration.baseFeatureId,
            operation: configuration.operation,
            features: configuration.resultFeatures.map((feature) =>
              this.specificationFeatureRepo.create({
                calculated: feature.calculated,
                featureId: feature.id,
              }),
            ),
            featuresDetermined: configuration.featuresDetermined,
            specificationId: snapshot.id,
          })),
        ),
      }),
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

  #serialize = (specification: SpecificationApiEntity): Specification => {
    return Specification.from({
      id: specification.id,
      draft: specification.draft,
      scenarioId: specification.scenarioId,
      config:
        specification.specificationFeaturesConfiguration?.map(
          (specificationFeature) => ({
            againstFeatureId:
              specificationFeature.againstFeatureId ?? undefined,
            baseFeatureId: specificationFeature.baseFeatureId,
            operation: specificationFeature.operation,
            featuresDetermined: specificationFeature.featuresDetermined,
            resultFeatures:
              specificationFeature.features?.map((feature) => ({
                id: feature.featureId,
                calculated: feature.calculated,
              })) ?? [],
          }),
        ) ?? [],
    });
  };
}
