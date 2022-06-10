import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { MarkLegacyProjectImportAsCanceled } from '../application/mark-legacy-project-import-as-canceled.command';
import { LegacyProjectImportCanceled } from '../domain/events/legacy-project-import-canceled.events';
import { ScheduleDbCleanupForFailedLegacyProjectImport } from './schedule-db-cleanup-for-failed-legacy-project-import.command';

@Injectable()
export class LegacyProjectImportCanceledSaga {
  @Saga()
  saga = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      ofType(LegacyProjectImportCanceled),
      mergeMap((event) =>
        of(
          new MarkLegacyProjectImportAsCanceled(event.projectId),
          new ScheduleDbCleanupForFailedLegacyProjectImport(event.projectId),
        ),
      ),
    );
}
