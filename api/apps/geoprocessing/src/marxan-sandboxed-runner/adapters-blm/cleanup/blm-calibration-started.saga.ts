import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BlmCalibrationStarted } from '../events/blm-calibration-started.event';
import { RemovePreviousCalibrationPartialResults } from './remove-previous-calibration-partial-results.command';

@Injectable()
export class BlmCalibrationStartedSaga {
  @Saga()
  scheduleExport = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      ofType(BlmCalibrationStarted),
      map(
        (event) =>
          new RemovePreviousCalibrationPartialResults(
            event.scenarioId,
            event.calibrationId,
          ),
      ),
    );
}
