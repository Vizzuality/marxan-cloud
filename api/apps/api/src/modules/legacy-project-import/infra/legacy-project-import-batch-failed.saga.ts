import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { MarkLegacyProjectImportAsFailed } from '../application/mark-legacy-project-import-as-failed.command';
import { LegacyProjectImportBatchFailed } from '../domain/events/legacy-project-import-batch-failed.event';
import { ScheduleDbCleanupForFailedLegacyProjectImport } from './schedule-db-cleanup-for-failed-legacy-project-import.command';

@Injectable()
export class LegacyProjectImportBatchFailedSaga {
  @Saga()
  saga = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      ofType(LegacyProjectImportBatchFailed),
      mergeMap((event) =>
        of(
          new MarkLegacyProjectImportAsFailed(
            event.projectId,
            `${event.batchNumber} batch contains failed pieces`,
          ),
          new ScheduleDbCleanupForFailedLegacyProjectImport(event.projectId),
        ),
      ),
    );
}
