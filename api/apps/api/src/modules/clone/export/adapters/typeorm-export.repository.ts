import { DbConnections } from '@marxan-api/ormconfig.connections';
import { ResourceKind } from '@marxan/cloning/domain';
import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Either, left, right } from 'fp-ts/lib/Either';
import {
  EntityManager,
  FindConditions,
  IsNull,
  Not,
  Repository,
} from 'typeorm';
import {
  ExportRepository,
  saveError,
  SaveError,
  Success,
} from '../application/export-repository.port';
import { Export, ExportId } from '../domain';
import { ExportComponentEntity } from './entities/export-components.api.entity';
import { ExportEntity } from './entities/exports.api.entity';
import { DbConnections } from '@marxan-api/ormconfig.connections';

@Injectable()
export class TypeormExportRepository implements ExportRepository {
  private inTransaction = false;

  constructor(
    @InjectRepository(ExportEntity)
    private readonly exportRepo: Repository<ExportEntity>,
    @InjectRepository(ExportComponentEntity)
    private readonly exportComponentRepo: Repository<ExportComponentEntity>,
    @InjectEntityManager(DbConnections.default)
    private readonly entityManager: EntityManager,
  ) {}

  async find(exportId: ExportId): Promise<Export | undefined> {
    const lock = this.inTransaction
      ? { mode: 'pessimistic_write' as const }
      : undefined;
    const exportEntity = await this.exportRepo.findOne(exportId.value, {
      lock,
    });
    if (!exportEntity) return undefined;

    /**
     * Extracting export components from it's own repo is needed
     * in order to be able to lock the reads when the operation is
     * executed within a transaction
     *
     * https://www.postgresql.org/message-id/21634.1160151923@sss.pgh.pa.us
     * https://stackoverflow.com/questions/46282087/hibernate-postgresql-select-for-update-with-outer-join-issue
     */
    const exportComponents = await this.exportComponentRepo.find({
      where: { exportId: exportEntity.id },
      relations: ['uris'],
    });

    exportEntity.components = exportComponents;

    return exportEntity.toAggregate();
  }

  async save(exportInstance: Export): Promise<Either<SaveError, Success>> {
    const exportEntity = ExportEntity.fromAggregate(exportInstance);
    try {
      await this.exportRepo.save(exportEntity);
    } catch (err) {
      return left(saveError);
    }

    return right(true);
  }

  async delete(exportId: ExportId): Promise<void> {
    await this.exportRepo.delete({ id: exportId.value });
  }

  async findLatestExportsFor(
    projectId: string,
    limit: number,
    options?: {
      isStandalone?: boolean;
      isFinished?: boolean;
      isLocal?: boolean;
    },
  ): Promise<Export[]> {
    const importResourceIdFilter = {
      importResourceId: options?.isStandalone ? IsNull() : Not(IsNull()),
    };
    const archiveLocationFilter = {
      archiveLocation: options?.isFinished ? Not(IsNull()) : IsNull(),
    };
    const foreignExportFilter = {
      foreignExport: !options?.isLocal,
    };
    const findConditions: FindConditions<ExportEntity> = {
      resourceId: projectId,
      resourceKind: ResourceKind.Project,
      ...(options?.isStandalone === undefined ? {} : importResourceIdFilter),
      ...(options?.isFinished === undefined ? {} : archiveLocationFilter),
      ...(options?.isLocal === undefined ? {} : foreignExportFilter),
    };

    const entities = await this.exportRepo.find({
      where: findConditions,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
      relations: ['components', 'components.uris'],
    });

    return entities.map((entity) => entity.toAggregate());
  }

  transaction<T>(code: (repo: ExportRepository) => Promise<T>): Promise<T> {
    return this.entityManager.transaction((transactionEntityManager) => {
      const transactionalRepository = new TypeormExportRepository(
        transactionEntityManager.getRepository(ExportEntity),
        transactionEntityManager.getRepository(ExportComponentEntity),
        transactionEntityManager,
      );
      transactionalRepository.inTransaction = true;
      return code(transactionalRepository);
    });
  }
}
