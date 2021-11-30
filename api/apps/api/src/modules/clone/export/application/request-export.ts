import { EventPublisher } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';

import {
  Export,
  ExportComponentSnapshot,
  ExportId,
  ResourceId,
  ResourceKind,
} from '../domain';

import { ExportRepository } from './export-repository.port';
import { ResourcePieces } from './resource-pieces.port';

@Injectable()
export class RequestExport {
  constructor(
    private readonly resourcePieces: ResourcePieces,
    private readonly exportRepository: ExportRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async export(id: ResourceId, kind: ResourceKind): Promise<ExportId> {
    const pieces: ExportComponentSnapshot[] = await this.resourcePieces.resolveFor(
      id,
      kind,
    );
    const exportRequest = this.eventPublisher.mergeObjectContext(
      Export.newOne(id, kind, pieces),
    );
    await this.exportRepository.save(exportRequest);

    exportRequest.commit();

    return exportRequest.id;
  }
}
