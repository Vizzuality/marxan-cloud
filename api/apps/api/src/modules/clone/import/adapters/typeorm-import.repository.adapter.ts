import { Import, ImportId } from '@marxan-api/modules/clone/import';
import {
  ImportRepository,
  saveError,
  SaveError,
} from '@marxan-api/modules/clone/import/application/import.repository.port';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Either, left, right } from 'fp-ts/lib/Either';
import { EntityManager, Repository } from 'typeorm';
import { DbConnections } from '../../../../ormconfig.connections';
import { Success } from '../application/import.repository.port';
import { ImportComponentEntity } from './entities/import-components.api.entity';
import { ImportEntity } from './entities/imports.api.entity';

export class TypeormImportRepository implements ImportRepository {
  private inTransaction = false;

  constructor(
    @InjectRepository(ImportEntity)
    private readonly importRepo: Repository<ImportEntity>,
    @InjectRepository(ImportComponentEntity)
    private readonly importComponentRepo: Repository<ImportComponentEntity>,
    @InjectEntityManager(DbConnections.default)
    private readonly entityManager: EntityManager,
  ) {}

  async find(importId: ImportId): Promise<Import | undefined> {
    const lock = this.inTransaction
      ? { mode: 'pessimistic_write' as const }
      : undefined;
    const importEntity = await this.importRepo.findOne(importId.value, {
      lock,
    });
    if (!importEntity) return undefined;

    const importComponents = await this.importComponentRepo.find({
      where: { importId: importEntity.id },
      relations: ['uris'],
    });

    importEntity.components = importComponents;

    return importEntity.toAggregate();
  }

  async save(importRequest: Import): Promise<Either<SaveError, Success>> {
    const importEntity = ImportEntity.fromAggregate(importRequest);

    try {
      await this.importRepo.save(importEntity);
    } catch (err) {
      return left(saveError);
    }

    return right(true);
  }

  transaction<T>(code: (repo: ImportRepository) => Promise<T>): Promise<T> {
    return this.entityManager.transaction((transactionEntityManager) => {
      const transactionalRepository = new TypeormImportRepository(
        transactionEntityManager.getRepository(ImportEntity),
        transactionEntityManager.getRepository(ImportComponentEntity),
        transactionEntityManager,
      );
      transactionalRepository.inTransaction = true;
      return code(transactionalRepository);
    });
  }
}
