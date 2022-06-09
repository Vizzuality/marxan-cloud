import { ResourceKind } from '@marxan/cloning/domain';
import { Either, right } from 'fp-ts/lib/Either';
import {
  ExportRepository,
  SaveError,
  Success,
} from '../application/export-repository.port';
import { Export, ExportId } from '../domain';

function createdAtPropertySorter(first: Export, second: Export): number {
  const firstDate = first.toSnapshot().createdAt;
  const secondDate = second.toSnapshot().createdAt;

  return secondDate.getTime() - firstDate.getTime();
}

export class MemoryExportRepo implements ExportRepository {
  #memory: Record<string, Export> = {};

  async find(exportId: ExportId): Promise<Export | undefined> {
    return this.#memory[exportId.value];
  }

  async save(exportInstance: Export): Promise<Either<SaveError, Success>> {
    this.#memory[exportInstance.id.value] = exportInstance;
    return right(true);
  }

  async findLatestExportsFor(
    projectId: string,
    limit = 5,
    options?: {
      isStandalone?: boolean;
      isFinished?: boolean;
      isLocal?: boolean;
    },
  ): Promise<Export[]> {
    return Object.values(this.#memory)
      .filter((exportInstance) => {
        const { resourceId } = exportInstance.toSnapshot();
        return projectId === resourceId && exportInstance.isForProject();
      })
      .filter((exportInstance) => {
        if (!options) return true;
        const { isFinished } = options;
        if (isFinished === undefined) return true;

        const exportHasFinished = exportInstance.hasFinished();

        return isFinished === exportHasFinished;
      })
      .filter((exportInstance) => {
        if (!options) return true;
        const { isStandalone } = options;
        if (isStandalone === undefined) return true;

        const isStandaloneExport = !exportInstance.isCloning();

        return isStandalone === isStandaloneExport;
      })
      .filter((exportInstance) => {
        if (!options) return true;
        const { isLocal } = options;
        if (isLocal === undefined) return true;

        const isLocalExport = !exportInstance.isForeignExport();

        return isLocal === isLocalExport;
      })
      .sort(createdAtPropertySorter)
      .slice(0, limit);
  }

  transaction<T>(code: (repo: ExportRepository) => Promise<T>): Promise<T> {
    return code(this);
  }
}
