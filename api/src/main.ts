import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import * as helmet from 'helmet';
import { CorsUtils } from './utils/cors.utils';
import { AppConfig } from 'utils/config.utils';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from 'filters/all-exceptions.exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // We forcibly prevent the app from starting if no `API_AUTH_JWT_SECRET`
  // environment variable has been set.
  if (!AppConfig.get('auth.jwt.secret')) {
    throw new Error(
      'No secret configured for the signing of JWT tokens. Please set the `API_AUTH_JWT_SECRET` environment variable.',
    );
  }

  app.use(helmet());
  app.enableCors({
    allowedHeaders: 'Content-Type,Authorization,Content-Disposition',
    exposedHeaders: 'Authorization',
    origin: CorsUtils.originHandler,
  });

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

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(3000);
}
bootstrap();
