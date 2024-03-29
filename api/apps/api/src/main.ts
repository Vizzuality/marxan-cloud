import { bootstrapSetUp } from '@marxan-api/bootstrap-app';
import { addSwagger } from '@marxan-api/add-swagger';
import { SwaggerModule } from '@nestjs/swagger';
import { AppConfig } from '@marxan-api/utils/config.utils';
import { json } from 'express';
import { complexGeometry } from './modules/uploads';
import * as cookieParser from 'cookie-parser';

export async function bootstrap() {
  const app = await bootstrapSetUp();

  const swaggerDocument = addSwagger(app);

  SwaggerModule.setup('/swagger', app, swaggerDocument);

  // The endpoint through which users can supply planning unit lock in/out data
  // via GeoJSON features will typically need to accept larger payloads than the
  // default size limit for endpoints that accept JSON payloads.
  // Here we use a larger limit than the one used for the shapefiles from which
  // the GeoJSON payload for this endpoint is generated, to take into account
  // the higher verbosity of JSON vs compressed Shapefile data.

  app.use(
    '/api/v1/scenarios/*/planning-units',
    json({ limit: complexGeometry()?.fileSize }),
  );

  // Feature specifications for legacy projects may be larger than the default
  // payload size limit.
  app.use(
    '/api/v1/projects/import/legacy/*/specification',
    json({ limit: '10MB' }),
  );
  // For everything else, stick to the default
  app.use(json({ limit: '100kb' }));

  app.use(cookieParser());

  await app.listen(AppConfig.get('api.daemonListenPort'));
}

bootstrap();
