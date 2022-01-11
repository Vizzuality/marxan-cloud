import { Injectable } from '@nestjs/common';

import { Export, ExportId } from '../domain';
import { ExportRepository } from '../application/export-repository.port';
import { InjectRepository } from '@nestjs/typeorm';
import { ExportEntity } from './entities/exports.api.entity';
import { ExportComponentEntity } from './entities/export-components.api.entity';
import { Repository } from 'typeorm';
import {
  ComponentId,
  ComponentLocation,
} from '../application/complete-piece.command';

@Injectable()
export class TypeormExportRepository implements ExportRepository {
  constructor(
    @InjectRepository(ExportEntity)
    private readonly exportRepo: Repository<ExportEntity>,
  ) {}

  async find(exportId: ExportId): Promise<Export | undefined> {
    const exportEntity = await this.exportRepo.findOne(exportId.value, {
      relations: ['components', 'components.uris'],
    });
    if (!exportEntity) return undefined;

    const exportInstance = Export.fromSnapshot({
      id: exportEntity.id,
      resourceId: exportEntity.resourceId,
      resourceKind: exportEntity.resourceKind,
      archiveLocation: exportEntity.archiveLocation,
      exportPieces: exportEntity.components.map((component) => ({
        id: new ComponentId(component.id),
        finished: component.finished,
        piece: component.piece,
        resourceId: component.resourceId,
        uri: component.uris.map(
          (element) => new ComponentLocation(element.uri, element.relativePath),
        ),
      })),
    });

    return exportInstance;
  }

  save(exportInstance: Export): Promise<void> {
    return Promise.resolve(undefined);
  }
}
