import { Either, right } from 'fp-ts/lib/Either';
import {
  ExportRepository,
  SaveError,
  Success,
} from '../application/export-repository.port';
import { Export, ExportId } from '../domain';

export class MemoryExportRepo implements ExportRepository {
  #memory: Record<string, Export> = {};

  async find(exportId: ExportId): Promise<Export | undefined> {
    return this.#memory[exportId.value];
  }

  async save(exportInstance: Export): Promise<Either<SaveError, Success>> {
    this.#memory[exportInstance.id.value] = exportInstance;
    return right(true);
  }

  transaction<T>(code: (repo: ExportRepository) => Promise<T>): Promise<T> {
    return code(this);
  }
}
