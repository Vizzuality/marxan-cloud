import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FeaturesCalculated } from '@marxan-api/modules/geo-features';
import { CalculateFeatures } from './calculate-features.command';

export class DetermineFeaturesSaga {
  @Saga()
  featuresCalculated = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      ofType(FeaturesCalculated),
      map((event) => new CalculateFeatures(event.featureIds)),
    );
}
