import { Test, TestingModule } from '@nestjs/testing';
import { ModuleMetadata } from '@nestjs/common/interfaces/modules/module-metadata.interface';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '@marxan-api/app.module';
import { QueueToken } from '../../src/modules/queue/queue.tokens';
import { FakeQueue, FakeQueueBuilder } from './queues';
import { QueueBuilder } from '@marxan-api/modules/queue/queue.builder';
import { ProjectChecker } from '@marxan-api/modules/scenarios/project-checker.service';
import { right } from 'fp-ts/Either';
import {
  FileRepository,
  TempStorageRepository,
} from '@marxan/files-repository';
import { ScenarioCalibrationRepo } from '../../src/modules/blm/values/scenario-calibration-repo';
import { FakeScenarioCalibrationRepo } from './scenario-calibration-repo.test.utils';

export const fakeProjectChecker: Pick<ProjectChecker, 'isProjectReady'> = {
  isProjectReady: async () => right(true),
};

export const bootstrapApplication = async (
  imports: ModuleMetadata['imports'] = [],
): Promise<INestApplication> => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule, ...imports],
  })
    .overrideProvider(QueueToken)
    .useClass(FakeQueue) // https://github.com/nestjs/nest/issues/2303#issuecomment-507563175
    .overrideProvider(QueueBuilder)
    .useClass(FakeQueueBuilder)
    .overrideProvider(ProjectChecker)
    .useValue(fakeProjectChecker)
    .overrideProvider(FileRepository)
    .useClass(TempStorageRepository)
    .overrideProvider(ScenarioCalibrationRepo)
    .useClass(FakeScenarioCalibrationRepo)
    .compile();

  return await moduleFixture
    .createNestApplication()
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
