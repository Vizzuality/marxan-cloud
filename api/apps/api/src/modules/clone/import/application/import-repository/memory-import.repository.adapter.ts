import {
  SaveError,
  ImportRepository,
  Success,
} from '@marxan-api/modules/clone/import/application/import-repository/import.repository.port';
import {
  Import,
  ImportId,
  ImportSnapshot,
} from '@marxan-api/modules/clone/import';
import { Either, right } from 'fp-ts/Either';

export class MemoryImportRepository extends ImportRepository {
  entities: Record<string, ImportSnapshot> = {};

  async find(importId: ImportId): Promise<Import | undefined> {
    const snapshot = this.entities[importId.value];
    if (!snapshot) return;

    return Import.fromSnapshot(snapshot);
  }

  async save(importRequest: Import): Promise<Either<SaveError, Success>> {
    const snapshot = importRequest.toSnapshot();
    this.entities[snapshot.id] = snapshot;
    return right(true);
  }

  transaction<T>(code: (repo: ImportRepository) => Promise<T>): Promise<T> {
    return code(this);
  }
}
