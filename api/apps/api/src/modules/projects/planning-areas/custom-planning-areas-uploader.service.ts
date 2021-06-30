import {
  FactoryProvider,
  HttpService,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Either, left, right } from 'fp-ts/Either';
import { AppConfig } from '@marxan-api/utils/config.utils';
import { apiGlobalPrefixes } from '@marxan-api/api.config';
import { GeoJSON } from 'geojson';

export const validationFailed = Symbol('validation failed');
export const geoprocessingUrlToken = Symbol('geoprocessing url token');
export const geoprocessingUrlProvider: FactoryProvider<string> = {
  provide: geoprocessingUrlToken,
  useFactory: () => AppConfig.get<string>('geoprocessing.url'),
};

@Injectable()
export class CustomPlanningAreasUploader {
  constructor(
    private readonly httpService: HttpService,
    @Inject(geoprocessingUrlToken)
    private readonly geoprocessingUrl: string,
  ) {}

  async savePlanningAreaFromShapefile(
    file: Express.Multer.File,
  ): Promise<
    Either<
      typeof validationFailed,
      {
        id: string;
        data: GeoJSON;
      }
    >
  > {
    const { data, status } = await this.httpService
      .post(
        `${this.geoprocessingUrl}${apiGlobalPrefixes.v1}/projects/planning-area/shapefile`,
        file,
        {
          headers: { 'Content-Type': 'application/json' },
          // pass-by 4xx
          validateStatus: (status) => status <= 499,
        },
      )
      .toPromise();
    if (status >= 400) {
      return left(validationFailed);
    }
    return right(data);
  }
}
