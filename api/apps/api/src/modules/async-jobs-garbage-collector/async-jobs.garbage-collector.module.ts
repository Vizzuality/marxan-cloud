import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsyncJobsModule } from './async-jobs/async-jobs.module';
import { ProjectAsyncJobsGarbageCollector } from './project-async-jobs.garbage-collector';
import { ScenarioAsyncJobsGarbageCollector } from './scenario-async-jobs.garbage-collector';
import { GarbageCollectAsyncJobsHandler } from './garbage-collect-async-jobs.handler';
import { UsersProjectsApiEntity } from '../access-control/projects-acl/entity/users-projects.api.entity';
import { UsersScenariosApiEntity } from '../access-control/scenarios-acl/entity/users-scenarios.api.entity';
import { UserLoggedInSaga } from './user-logged-in.saga';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsersProjectsApiEntity, UsersScenariosApiEntity]),
    AsyncJobsModule,
  ],
  providers: [
    UserLoggedInSaga,
    GarbageCollectAsyncJobsHandler,
    ProjectAsyncJobsGarbageCollector,
    ScenarioAsyncJobsGarbageCollector,
    GarbageCollectAsyncJobsHandler,
  ],
})
export class AsyncJobsGarbageCollectorModule {}
