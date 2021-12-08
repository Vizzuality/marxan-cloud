import { ResourceId } from '@marxan/cloning/domain';
import { Export } from '../domain';

export abstract class ExportRepository {
  abstract save(exportInstance: Export): Promise<void>;

  abstract find(projectId: ResourceId): Promise<Export | undefined>;
}
