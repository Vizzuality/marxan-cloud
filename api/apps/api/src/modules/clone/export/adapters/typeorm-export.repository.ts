import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import {
  ComponentId,
  ComponentLocation,
} from '../application/complete-piece.command';
import { ExportRepository } from '../application/export-repository.port';
import { Export, ExportId } from '../domain';
import { ExportEntity } from './entities/exports.api.entity';
import { DbConnections } from '@marxan-api/ormconfig.connections';

@Injectable()
export class TypeormExportRepository implements ExportRepository {
  private inTransaction = false;

  constructor(
    @InjectRepository(ExportEntity)
    private readonly exportRepo: Repository<ExportEntity>,
    @InjectEntityManager(DbConnections.default)
    private readonly entityManager: EntityManager,
  ) {}

  async find(exportId: ExportId): Promise<Export | undefined> {
    const exportEntity = await this.exportRepo.findOne(exportId.value, {
      relations: ['components', 'components.uris'],
    });
    if (!exportEntity) return undefined;

    return Export.fromSnapshot({
      id: exportEntity.id,
      resourceId: exportEntity.resourceId,
      resourceKind: exportEntity.resourceKind,
      archiveLocation: exportEntity.archiveLocation,
      exportPieces: exportEntity.components.map((component) => ({
        id: new ComponentId(component.id),
        finished: component.finished,
        piece: component.piece,
        resourceId: component.resourceId,
        uris: component.uris.map(
          (element) => new ComponentLocation(element.uri, element.relativePath),
        ),
      })),
    });
  }

  async save(exportInstance: Export): Promise<void> {
    const exportEntity = ExportEntity.fromAggregate(exportInstance);

    await this.exportRepo.save(exportEntity);
  }

  transaction<T>(code: (repo: ExportRepository) => Promise<T>): Promise<T> {
    return this.entityManager.transaction((transactionEntityManager) => {
      const transactionalRepository = new TypeormExportRepository(
        transactionEntityManager.getRepository(ExportEntity),
        transactionEntityManager,
      );
      transactionalRepository.inTransaction = true;
      return code(transactionalRepository);
    });
  }
}
