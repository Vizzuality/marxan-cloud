import { EventBus, EventPublisher } from '@nestjs/cqrs';

import { ResourceId } from '../domain/export/resource.id';
import { ResourceKind } from '../domain/export/resource.kind';
import { ClonePart } from '../domain/export/clone-part/clone-part';
import { Export } from '../domain/export/export';
import { ExportId } from '../domain/export/export.id';

import { ExportRepository } from './export-repository.port';
import { ResourcePieces } from './resource-pieces.port';

export class RequestExport {
  constructor(
    private readonly resourcePieces: ResourcePieces,
    private readonly exportRepository: ExportRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async export(id: ResourceId, kind: ResourceKind): Promise<ExportId> {
    const parts: ClonePart[] = await this.resourcePieces.resolveFor(id, kind);
    const exportInstance = this.eventPublisher.mergeObjectContext(
      Export.project(id, parts),
    );
    await this.exportRepository.save(exportInstance);

    exportInstance.commit();

    return exportInstance.id;
  }
}
