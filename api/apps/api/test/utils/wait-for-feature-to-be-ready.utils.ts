import { JobStatus } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { GeoFeature } from '@marxan-api/modules/geo-features/geo-feature.api.entity';
import { Repository } from 'typeorm';
import { waitFor } from './wait-for.utils';

export const waitForFeatureToBeReady = async (
  geoFeaturesApiRepo: Repository<GeoFeature>,
  featureId: string,
) => {
  const checkFn = async () => {
    return await geoFeaturesApiRepo
      .findOne({
        where: {
          id: featureId,
          creationStatus: JobStatus.created,
        },
      })
      .then((result) => result !== undefined);
  };

  await waitFor(
    {
      description: 'feature to be ready',
      fn: checkFn,
    },
    {
      maxTries: 10,
      intervalMs: 2000,
    },
  );
};
