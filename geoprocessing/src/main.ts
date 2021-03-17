import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { QueueScheduler } from 'bullmq';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const queueScheduler = new QueueScheduler('planning-units', {
    connection: {
      host: 'marxan-redis',
      port: 6379,
    },
  });
  await app.listen(3000);
}
bootstrap();
