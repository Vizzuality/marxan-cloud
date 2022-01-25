import { DbConnections } from '@marxan-api/ormconfig.connections';
import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ExportRepository } from '../application/export-repository.port';
import { Export, ExportId } from '../domain';
import { ExportComponentEntity } from './entities/export-components.api.entity';
import { ExportEntity } from './entities/exports.api.entity';

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

  async save(exportInstance: Export): Promise<void> {
    const exportEntity = ExportEntity.fromAggregate(exportInstance);

    await this.exportRepo.save(exportEntity);
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
