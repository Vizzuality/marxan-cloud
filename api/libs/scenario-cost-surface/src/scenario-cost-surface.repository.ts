import { Inject, Injectable } from '@nestjs/common';
import { EntityManager, QueryRunner, Repository } from 'typeorm';
import { LargeObjectManager } from 'pg-large-object';
import { Client } from 'pg';
import { PostgresQueryRunner } from 'typeorm/driver/postgres/PostgresQueryRunner';
import { Writable, Readable } from 'stream';
import { pick } from 'lodash';
import { isDefined } from '@marxan/utils';
import {
  ArtifactType,
  CostSurfaceFileCache,
  createCostSurfaceFileCacheFields,
} from './cost-surface-file-cache.api.entity';

export const CacheNotFound = Symbol('entity not found');
export class ErrorWithSymbol extends Error {
  constructor(public readonly errorSymbol: typeof CacheNotFound) {
    super(errorSymbol.toString());
  }
}
export const StreamPiped = Symbol('stream piped');
export const EntityManagerToken = Symbol();
@Injectable()
export class ScenarioCostSurfaceRepository {
  /**
   * 2048 is a minimum, and bufferSize should be divisible by it
   */
  readonly #bufferSize = 8 * 2048;

  constructor(
    @Inject(EntityManagerToken)
    private readonly entityManager: EntityManager,
  ) {}

  async save(
    entityToSave: Pick<
      CostSurfaceFileCache,
      typeof createCostSurfaceFileCacheFields[number]
    >,
    artifactStream: Readable,
  ): Promise<void> {
    await this.entityManager.transaction(async (transactionalEntityManager) => {
      const repository =
        transactionalEntityManager.getRepository(CostSurfaceFileCache);
      const existingEntity = await repository.findOne({
        scenarioId: entityToSave.scenarioId,
        artifactType: entityToSave.artifactType,
      });

      const largeObjectManager = await this.createLargeObjectManager(
        transactionalEntityManager,
      );

      if (existingEntity && isDefined(existingEntity.artifact)) {
        await largeObjectManager.unlinkAsync(existingEntity.artifact);
      }

      const savedEntity = await repository.save({
        ...existingEntity,
        ...pick(entityToSave, createCostSurfaceFileCacheFields),
      });

      await this.saveArtifact(
        largeObjectManager,
        artifactStream,
        repository,
        savedEntity.id,
      );
    });
  }

  async read(
    scenarioId: string,
    type: ArtifactType,
    output: Writable,
  ): Promise<void> {
    await this.entityManager.transaction(async (transactionalEntityManager) => {
      const repository =
        transactionalEntityManager.getRepository(CostSurfaceFileCache);
      const cacheEntity = await repository.findOne({
        scenarioId,
        artifactType: type,
      });
      const artifactOid = cacheEntity?.artifact;
      if (!isDefined(artifactOid)) {
        output.emit('error', new ErrorWithSymbol(CacheNotFound));
        return;
      }

      const largeObjectManager = await this.createLargeObjectManager(
        transactionalEntityManager,
      );
      const [, artifactStream] =
        await largeObjectManager.openAndReadableStreamAsync(
          artifactOid,
          this.#bufferSize,
        );
      await new Promise((resolve, reject) => {
        artifactStream.on('end', resolve).on('error', reject).pipe(output);
      });
    });
  }

  async remove(scenarioId: string, artifactType: ArtifactType): Promise<void> {
    await this.entityManager.transaction(async (transactionalEntityManager) => {
      const repository =
        transactionalEntityManager.getRepository(CostSurfaceFileCache);
      const cacheEntity = await repository.findOne({
        scenarioId,
        artifactType,
      });
      if (!cacheEntity) {
        return;
      }
      const artifactOid = cacheEntity.artifact;
      if (isDefined(artifactOid)) {
        const largeObjectManager = await this.createLargeObjectManager(
          transactionalEntityManager,
        );
        await largeObjectManager.unlinkAsync(artifactOid);
      }
      await repository.delete(cacheEntity.id);
    });
  }

  private async saveArtifact(
    largeObjectManager: LargeObjectManager,
    artifactStream: Readable,
    repository: Repository<CostSurfaceFileCache>,
    savedEntityId: string,
  ) {
    const [oid, largeObjectStream] =
      await largeObjectManager.createAndWritableStreamAsync(this.#bufferSize);
    await new Promise((resolve, reject) => {
      largeObjectStream.on('finish', resolve).on('error', reject);
      artifactStream.pipe(largeObjectStream);
    });
    await repository.update(savedEntityId, {
      artifact: oid,
    });
  }

  private async createLargeObjectManager({
    queryRunner,
  }: EntityManager): Promise<LargeObjectManager> {
    this.assertPostgres(queryRunner);
    // it obtains an underlying connection, does not create a new one
    // so a transaction is preserved
    const client: Client = await queryRunner.connect();
    return new LargeObjectManager({ pg: client });
  }

  private assertPostgres(
    queryRunner: QueryRunner | undefined,
  ): asserts queryRunner is PostgresQueryRunner {
    if (!(queryRunner instanceof PostgresQueryRunner)) {
      throw new Error('Other databases than postgres are not supported');
    }
  }
}
