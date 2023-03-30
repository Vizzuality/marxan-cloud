import { ResourceId } from '@marxan/cloning/domain';
import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Either, left, right } from 'fp-ts/lib/Either';
import { EntityManager, Repository } from 'typeorm';
import { DbConnections } from '../../../ormconfig.connections';
import { LegacyProjectImport } from '../domain/legacy-project-import/legacy-project-import';
import {
  legacyProjectImportNotFound,
  LegacyProjectImportRepository,
  legacyProjectImportSaveError,
} from '../domain/legacy-project-import/legacy-project-import.repository';
import { LegacyProjectImportComponentEntity } from './entities/legacy-project-import-component.api.entity';
import { LegacyProjectImportFileEntity } from './entities/legacy-project-import-file.api.entity';
import { LegacyProjectImportEntity } from './entities/legacy-project-import.api.entity';

@Injectable()
export class LegacyProjectImportTypeormRepository
  implements LegacyProjectImportRepository {
  private inTransaction = false;

  constructor(
    @InjectRepository(LegacyProjectImportEntity)
    private readonly legacyProjectImportRepo: Repository<LegacyProjectImportEntity>,
    @InjectRepository(LegacyProjectImportComponentEntity)
    private readonly legacyProjectImportComponentRepo: Repository<LegacyProjectImportComponentEntity>,
    @InjectRepository(LegacyProjectImportFileEntity)
    private readonly legacyProjectImportFileRepo: Repository<LegacyProjectImportFileEntity>,
    @InjectEntityManager(DbConnections.default)
    private readonly entityManager: EntityManager,
  ) {}

  async find(
    projectId: ResourceId,
  ): Promise<Either<typeof legacyProjectImportNotFound, LegacyProjectImport>> {
    const lock = this.inTransaction
      ? { mode: 'pessimistic_write' as const }
      : undefined;

    const legacyProjectImport = await this.legacyProjectImportRepo.findOne({
      where: { projectId: projectId.value },
      lock,
    });

    if (!legacyProjectImport) return left(legacyProjectImportNotFound);

    const pieces = await this.legacyProjectImportComponentRepo.find({
      where: { legacyProjectImportId: legacyProjectImport.id },
    });
    const files = await this.legacyProjectImportFileRepo.find({
      where: {
        legacyProjectImportId: legacyProjectImport.id,
      },
    });

    legacyProjectImport.pieces = pieces;
    legacyProjectImport.files = files;

    return right(legacyProjectImport.toDomain());
  }

  async save(
    legacyProjectImport: LegacyProjectImport,
  ): Promise<Either<typeof legacyProjectImportSaveError, true>> {
    try {
      await this.legacyProjectImportRepo.save(
        LegacyProjectImportEntity.fromSnapshot(
          legacyProjectImport.toSnapshot(),
        ),
      );

      return right(true);
    } catch (err) {
      return left(legacyProjectImportSaveError);
    }
  }

  transaction<T>(
    code: (repo: LegacyProjectImportRepository) => Promise<T>,
  ): Promise<T> {
    return this.entityManager.transaction((transactionEntityManager) => {
      const transactionalRepository = new LegacyProjectImportTypeormRepository(
        transactionEntityManager.getRepository(LegacyProjectImportEntity),
        transactionEntityManager.getRepository(
          LegacyProjectImportComponentEntity,
        ),
        transactionEntityManager.getRepository(LegacyProjectImportFileEntity),
        transactionEntityManager,
      );
      transactionalRepository.inTransaction = true;
      return code(transactionalRepository);
    });
  }
}
