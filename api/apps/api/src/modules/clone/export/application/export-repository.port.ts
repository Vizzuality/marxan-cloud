import { Export, ExportId } from '../domain';

export abstract class ExportRepository {
  abstract save(exportInstance: Export): Promise<void>;

  abstract find(projectId: ExportId): Promise<Export | undefined>;

  abstract transaction<T>(
    code: (repo: ExportRepository) => Promise<T>,
  ): Promise<T>;
}
