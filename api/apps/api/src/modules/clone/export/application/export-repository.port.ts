import { Export, ResourceId } from '../domain';

export abstract class ExportRepository {
  abstract save(exportInstance: Export): Promise<void>;

  abstract find(projectId: ResourceId): Promise<Export | undefined>;
}
