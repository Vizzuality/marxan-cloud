import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { QueueToken } from '../../src/modules/queue/queue.tokens';
import { FakeQueue } from './queues';

export const bootstrapApplication = async (): Promise<INestApplication> => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(QueueToken)
    .useValue(new FakeQueue()) // https://github.com/nestjs/nest/issues/2303#issuecomment-507563175
    .compile();

  const app = moduleFixture.createNestApplication();
  return app
    .enableShutdownHooks()
    .useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    .init();
};
