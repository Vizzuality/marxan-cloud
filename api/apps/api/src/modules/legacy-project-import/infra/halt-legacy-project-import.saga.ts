import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { MarkLegacyProjectImportAsCanceled } from '../application/mark-legacy-project-import-as-canceled.command';
import { HaltLegacyProjectImport } from '../domain/events/halt-legacy-project-import.events';
import { ScheduleDbCleanupForFailedLegacyProjectImport } from './schedule-db-cleanup-for-failed-legacy-project-import.command';

@Injectable()
export class HaltLegacyProjectImportSaga {
  @Saga()
  saga = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      ofType(HaltLegacyProjectImport),
      mergeMap((event) =>
        of(
          new MarkLegacyProjectImportAsCanceled(event.projectId),
          new ScheduleDbCleanupForFailedLegacyProjectImport(event.projectId),
        ),
      ),
    );
}
