import { Injectable } from '@nestjs/common';
import { FeatureNumbers, GetNonGeoFeatureData } from '../../application';

@Injectable()
export class GeocodingGetNonGeoFeatureData implements GetNonGeoFeatureData {
  // TODO there will be all TypeORM stuff
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async resolve(scenarioId: string): Promise<FeatureNumbers[]> {
    return [
      {
        target: 50,
        fpf: 1,
        metArea: 10000,
        totalArea: 20000,
        id: 'feature-id',
      },
    ];
  }
}
