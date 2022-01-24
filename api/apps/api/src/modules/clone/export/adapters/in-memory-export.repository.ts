import { ExportRepository } from '../application/export-repository.port';
import { Export, ExportId } from '../domain';

export class InMemoryExportRepo implements ExportRepository {
  #memory: Record<string, Export> = {};

  async find(exportId: ExportId): Promise<Export | undefined> {
    return this.#memory[exportId.value];
  }

  async save(exportInstance: Export): Promise<void> {
    this.#memory[exportInstance.id.value] = exportInstance;
  }

  transaction<T>(code: (repo: ExportRepository) => Promise<T>): Promise<T> {
    return code(this);
  }
}
