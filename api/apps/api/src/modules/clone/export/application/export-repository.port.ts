import { Export } from '../domain/export/export';
import { ResourceId } from '../domain/export/resource.id';

export abstract class ExportRepository {
  abstract save(exportInstance: Export): Promise<void>;

  abstract find(projectId: ResourceId): Promise<Export | undefined>;
}
