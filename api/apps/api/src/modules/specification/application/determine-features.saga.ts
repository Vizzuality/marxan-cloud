import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FeaturesCreated } from '@marxan-api/modules/scenarios-features';
import { DetermineFeatures } from './determine-features.command';

export class DetermineFeaturesSaga {
  @Saga()
  featuresCreated = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      ofType(FeaturesCreated),
      map(
        (event) =>
          new DetermineFeatures(
            {
              ...event.input,
              features: event.input.features.map((feature) => ({
                featureId: feature.id,
                calculated: feature.calculated,
              })),
            },
            event.specificationId,
          ),
      ),
    );
}
