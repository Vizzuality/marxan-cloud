import { Module } from '@nestjs/common';
import { ApiEventsModule } from '../../api-events';
import { FeatureShapefileImportEventsPort } from '@marxan-api/modules/geo-features/ports/feature-shapefile-import-events-port';
import { FeatureShapefileImportApiEvents } from '@marxan-api/modules/geo-features/adapters/feature-shapefile-upload-api-events';

@Module({
  imports: [ApiEventsModule],
  providers: [
    {
      provide: FeatureShapefileImportEventsPort,
      useClass: FeatureShapefileImportApiEvents,
    },
  ],
  exports: [FeatureShapefileImportEventsPort],
})
export class GeoFeaturesAdaptersModule {}
