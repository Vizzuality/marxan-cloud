import {
  ArchiveLocation,
  ResourceId,
  ResourceKind,
} from '@marxan/cloning/domain';
import { UserId } from '@marxan/domain-ids';
import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { ExportRepository } from '../../export/application/export-repository.port';
import { ArchiveReady } from '../../export/domain';
import { ImportProject } from '../../import/application/import-project.command';
import { ImportScenario } from '../../import/application/import-scenario.command';
import { MarkExportAsFinished } from './mark-export-as-finished.command';

type CommandMapper = (
  archiveLocation: string,
  ownerId: string,
  importResourceId: string,
) => ICommand;

@Injectable()
export class ArchiveReadySaga {
  constructor(private readonly exportRepository: ExportRepository) {}

  private commandMapper: Record<ResourceKind, CommandMapper> = {
    project: (
      archiveLocation: string,
      ownerId: string,
      importResourceId: string,
    ) =>
      new ImportProject(
        new ArchiveLocation(archiveLocation),
        new UserId(ownerId),
        new ResourceId(importResourceId),
      ),
    scenario: (
      archiveLocation: string,
      ownerId: string,
      importResourceId: string,
    ) =>
      new ImportScenario(
        new ArchiveLocation(archiveLocation),
        new UserId(ownerId),
        new ResourceId(importResourceId),
      ),
  };

  private async getCommands(event: ArchiveReady) {
    const exportInstance = await this.exportRepository.find(event.exportId);

    if (!exportInstance) throw new Error('cant find export');

    const {
      resourceKind,
      archiveLocation,
      importResourceId,
      ownerId,
    } = exportInstance.toSnapshot();

    if (!exportInstance.isClonning())
      return [new MarkExportAsFinished(event.exportId)];

    if (!archiveLocation || !importResourceId)
      throw new Error(
        'When clonning, the archiveLocation and importResourceId should be ready',
      );

    const importCommand = this.commandMapper[resourceKind](
      archiveLocation,
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
