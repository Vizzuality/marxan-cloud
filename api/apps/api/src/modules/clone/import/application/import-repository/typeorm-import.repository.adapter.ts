import {
  Failure,
  ImportRepository,
  Success,
  unknownError,
} from '@marxan-api/modules/clone/import/application/import-repository/import.repository.port';
import { Import, ImportId } from '@marxan-api/modules/clone/import';
import { Either, left } from 'fp-ts/Either';

export class TypeormImportRepository extends ImportRepository {
  async find(importId: ImportId): Promise<Import | undefined> {
    throw new Error('Implement me!');

    return Promise.resolve(undefined);
  }

  async save(importRequest: Import): Promise<Either<Failure, Success>> {
    throw new Error('Implement me!');

    return left(unknownError);
  }
}
