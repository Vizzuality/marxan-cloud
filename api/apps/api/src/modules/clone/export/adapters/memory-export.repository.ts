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
    limit: number = 5,
    options?: {
      isStandalone?: boolean;
      isFinished?: boolean;
      isLocal?: boolean;
    },
  ): Promise<Export[]> {
    return Object.values(this.#memory)
      .filter((exportInstance) => {
        const { resourceId, resourceKind } = exportInstance.toSnapshot();
        return (
          projectId === resourceId && resourceKind === ResourceKind.Project
        );
      })
      .filter((exportInstance) => {
        const { archiveLocation } = exportInstance.toSnapshot();
        return options?.isFinished === undefined || options.isFinished
          ? archiveLocation !== undefined
          : archiveLocation === undefined;
      })
      .filter((exportInstance) => {
        const { importResourceId } = exportInstance.toSnapshot();
        return options?.isStandalone === undefined || options.isStandalone
          ? importResourceId === undefined
          : importResourceId !== undefined;
      })
      .filter((exportInstance) => {
        const { foreignExport } = exportInstance.toSnapshot();
        return (
          options?.isLocal === undefined || foreignExport === !options.isLocal
        );
      })
      .sort(createdAtPropertySorter)
      .slice(0, limit);
  }

  transaction<T>(code: (repo: ExportRepository) => Promise<T>): Promise<T> {
    return code(this);
  }
}
