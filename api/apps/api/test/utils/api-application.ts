import { Test, TestingModule } from '@nestjs/testing';
import { ModuleMetadata } from '@nestjs/common/interfaces/modules/module-metadata.interface';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '@marxan-api/app.module';
import { QueueToken } from '../../src/modules/queue/queue.tokens';
import { FakeQueue, FakeQueueBuilder } from './queues';
import { QueueBuilder } from '@marxan-api/modules/queue/queue.builder';
import {
  FileRepository,
  TempStorageRepository,
} from '@marxan/files-repository';
import { ProjectChecker } from '@marxan-api/modules/projects/project-checker/project-checker.service';
import { ScenarioCalibrationRepo } from '../../src/modules/blm/values/scenario-calibration-repo';
import { FakeScenarioCalibrationRepo } from './scenario-calibration-repo.test.utils';
import { ProjectCheckerFake } from './project-checker.service-fake';
import { ExportRepository } from '@marxan-api/modules/clone/export/application/export-repository.port';
import { InMemoryExportRepo } from '@marxan-api/modules/clone/export/adapters/in-memory-export.repository';

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
    .useClass(ProjectCheckerFake)
    .overrideProvider(FileRepository)
    .useClass(TempStorageRepository)
    .overrideProvider(ScenarioCalibrationRepo)
    .useClass(FakeScenarioCalibrationRepo)
    .overrideProvider(ExportRepository)
    .useClass(InMemoryExportRepo)
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
