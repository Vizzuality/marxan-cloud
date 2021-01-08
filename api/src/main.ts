import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import * as helmet from 'helmet';
import { CorsUtils } from './utils/cors.utils';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.enableCors({
    allowedHeaders: 'Content-Type,Authorization,Content-Disposition',
    exposedHeaders: 'Authorization',
    origin: CorsUtils.originHandler,
  });

  // Set a global prefix for all API controller routes; this needs to be set
  // before setting up the OpenAPI document in order for the prefix to be
  // applied automatically to the routes in the OpenAPI documentation.
  app.setGlobalPrefix('/api/v1');

  // OpenAPI documentation module - setup
  const swaggerOptions = new DocumentBuilder()
    .setTitle('MarxanCloud API')
    .setDescription('MarxanCloud is a conservation planning platform.')
    .setVersion(process.env.npm_package_version || 'development')
    .addBearerAuth({
      type: 'apiKey',
      in: 'header',
      name: 'Authorization',
    })
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerOptions);
  SwaggerModule.setup('/swagger', app, swaggerDocument);

  await app.listen(3000);
}
bootstrap();
