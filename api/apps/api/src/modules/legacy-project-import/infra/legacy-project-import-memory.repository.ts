import { ResourceId } from '@marxan/cloning/domain';
import { Injectable } from '@nestjs/common';
import { Either, left, right } from 'fp-ts/lib/Either';
import { LegacyProjectImport } from '../domain/legacy-project-import/legacy-project-import';
import {
  legacyProjectImportNotFound,
  LegacyProjectImportRepository,
  legacyProjectImportSaveError,
} from '../domain/legacy-project-import/legacy-project-import.repository';
import { LegacyProjectImportEntity } from './entities/legacy-project-import.api.entity';

@Injectable()
export class LegacyProjectImportMemoryRepository
  implements LegacyProjectImportRepository {
  private readonly legacyProjectImports: LegacyProjectImportEntity[] = [];

  async find(
    projectId: ResourceId,
  ): Promise<Either<typeof legacyProjectImportNotFound, LegacyProjectImport>> {
    const legacyProjectImport = this.legacyProjectImports.find(
      (entity) => entity.projectId === projectId.value,
    );

    if (!legacyProjectImport) return left(legacyProjectImportNotFound);

    return right(legacyProjectImport.toDomain());
  }

  async save(
    legacyProjectImport: LegacyProjectImport,
  ): Promise<Either<typeof legacyProjectImportSaveError, true>> {
    this.legacyProjectImports.push(
      LegacyProjectImportEntity.fromSnapshot(legacyProjectImport.toSnapshot()),
    );

    return right(true);
  }

  transaction<T>(
    code: (repo: LegacyProjectImportRepository) => Promise<T>,
  ): Promise<T> {
    return code(this);
  }
}
