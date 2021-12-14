import { ResourceId } from '@marxan/cloning/domain';
import { Injectable } from '@nestjs/common';

import { Export } from '../domain';
import { ExportRepository } from '../application/export-repository.port';

@Injectable()
export class TypeormExportRepository implements ExportRepository {
  find(projectId: ResourceId): Promise<Export | undefined> {
    return Promise.resolve(undefined);
  }

  save(exportInstance: Export): Promise<void> {
    return Promise.resolve(undefined);
  }
}
