import { Module } from '@nestjs/common';
import { GetFeatureMetadata, GetNonGeoFeatureData } from '../application';
import { GeocodingGetNonGeoFeatureData } from './adapters/geocoding-get-non-geo-feature-data';
import { TypeormGetFeatureMetadata } from './adapters/typeorm-get-feature-metadata';

@Module({
  imports: [
    // TypeOrm
  ],
  providers: [
    {
      provide: GetFeatureMetadata,
      useClass: TypeormGetFeatureMetadata,
    },
    {
      provide: GetNonGeoFeatureData,
      useClass: GeocodingGetNonGeoFeatureData,
    },
  ],
  exports: [GetFeatureMetadata, GetNonGeoFeatureData],
})
export class ScenariosFeaturesAdaptersModule {}
