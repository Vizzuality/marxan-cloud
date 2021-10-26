import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindManyOptions, In, Repository } from 'typeorm';
import { keyBy } from 'lodash';

import { DbConnections } from '@marxan-api/ormconfig.connections';

import { Specification } from '../domain';
import { SpecificationRepository } from '../application/specification.repository';

import { SpecificationApiEntity } from './specification.api.entity';
import { SpecificationFeatureConfigApiEntity } from './specification-feature-config.api.entity';

@Injectable()
export class DbSpecificationRepository implements SpecificationRepository {
  private inTransaction = false;

  constructor(
    @InjectRepository(SpecificationApiEntity)
    private readonly specificationRepo: Repository<SpecificationApiEntity>,
    @InjectRepository(SpecificationFeatureConfigApiEntity)
    private readonly specificationFeatureConfigRepo: Repository<SpecificationFeatureConfigApiEntity>,
    @InjectEntityManager(DbConnections.default)
    private readonly entityManager: EntityManager,
  ) {}

  async getById(id: string): Promise<Specification | undefined> {
    const specification = (await this.findByIdsWithLock([id]))[0];

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
            features: configuration.resultFeatures.map((feature) => ({
              calculated: feature.calculated,
              featureId: feature.featureId,
            })),
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

  transaction<T>(
    code: (repo: SpecificationRepository) => Promise<T>,
  ): Promise<T> {
    return this.entityManager.transaction((transactionEntityManager) => {
      const transactionalRepository = new DbSpecificationRepository(
        transactionEntityManager.getRepository(SpecificationApiEntity),
        transactionEntityManager.getRepository(
          SpecificationFeatureConfigApiEntity,
        ),
        transactionEntityManager,
      );
      transactionalRepository.inTransaction = true;
      return code(transactionalRepository);
    });
  }

  async getLastUpdated(ids: string[]): Promise<Specification | undefined> {
    const specs = await this.findByIdsWithLock(ids, {
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
                featureId: feature.featureId,
                calculated: feature.calculated,
              })) ?? [],
          }),
        ) ?? [],
    });
  };

  private async findByIdsWithLock(
    specIds: string[],
    findManyOptions: FindManyOptions<SpecificationApiEntity> = {},
  ) {
    const lock = this.inTransaction
      ? { mode: 'pessimistic_write' as const }
      : undefined;
    const specifications = await this.specificationRepo.findByIds(specIds, {
      lock,
      loadEagerRelations: false,
      ...findManyOptions,
    });

    const specificationLookup = keyBy(
      specifications,
      (specification) => specification.id,
    );

    const configs = await this.specificationFeatureConfigRepo.find({
      where: { specificationId: In(specIds) },
      lock,
      loadEagerRelations: false,
    });

    for (const config of configs) {
      const specification = specificationLookup[config.specificationId];
      if (!specification) {
        continue;
      }
      specification.specificationFeaturesConfiguration ??= [];
      specification.specificationFeaturesConfiguration.push(config);
    }
    return specifications;
  }
}
