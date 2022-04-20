import { ResourceId, ResourceKind } from '@marxan/cloning/domain';
import { UserId } from '@marxan/domain-ids';
import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { ExportRepository } from '../../export/application/export-repository.port';
import { ArchiveReady, ExportId } from '../../export/domain';
import { ImportProject } from '../../import/application/import-project.command';
import { ImportScenario } from '../../import/application/import-scenario.command';
import { MarkExportAsFinished } from './mark-export-as-finished.command';

type CommandMapper = (
  exportId: ExportId,
  ownerId: string,
  importResourceId: string,
) => ICommand;

@Injectable()
export class ArchiveReadySaga {
  constructor(private readonly exportRepository: ExportRepository) {}

  private commandMapper: Record<ResourceKind, CommandMapper> = {
    project: (exportId: ExportId, ownerId: string, importResourceId: string) =>
      new ImportProject(
        exportId,
        new UserId(ownerId),
        new ResourceId(importResourceId),
      ),
    scenario: (exportId: ExportId, ownerId: string, importResourceId: string) =>
      new ImportScenario(
        exportId,
        new UserId(ownerId),
        new ResourceId(importResourceId),
      ),
  };

  private async getCommands(event: ArchiveReady) {
    const exportInstance = await this.exportRepository.find(event.exportId);

    if (!exportInstance) throw new Error('cant find export');

    const {
      resourceKind,
      importResourceId,
      ownerId,
    } = exportInstance.toSnapshot();

    if (!exportInstance.isCloning())
      return [new MarkExportAsFinished(event.exportId)];

    if (!importResourceId)
      throw new Error('When cloning importResourceId should be ready');

    const importCommand = this.commandMapper[resourceKind](
      event.exportId,
      ownerId,
      importResourceId,
    );

    return [new MarkExportAsFinished(event.exportId), importCommand];
  }

  @Saga()
  emitApiEvents = (events$: Observable<any>) => {
    return events$.pipe(
      ofType(ArchiveReady),
      mergeMap((event) => from(this.getCommands(event))),
      mergeMap((commands) => from(commands)),
    );
  };
}
