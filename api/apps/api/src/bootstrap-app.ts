import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import * as helmet from 'helmet';
import { CorsUtils } from './utils/cors.utils';
import { AppConfig } from '@marxan-api/utils/config.utils';
import { ValidationPipe } from '@nestjs/common';

export async function bootstrapSetUp() {
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
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  return app;
}
