import { Module } from '@nestjs/common';
import { PublishedProjectService } from './published-project.service';
import { ProjectsModule } from '@marxan-api/modules/projects/projects.module';
import { PublishedProjectCrudService } from '@marxan-api/modules/published-project/published-project-crud.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublishedProject } from '@marxan-api/modules/published-project/entities/published-project.api.entity';
import { PublishedProjectReadController } from '@marxan-api/modules/published-project/controllers/published-project-read.controller';
import { PublishProjectController } from '@marxan-api/modules/published-project/controllers/publish-project.controller';
import { PublishedProjectSerializer } from '@marxan-api/modules/published-project/published-project.serializer';
import { AccessControlModule } from '@marxan-api/modules/access-control';
import { UsersModule } from '@marxan-api/modules/users/users.module';

@Module({
  imports: [
    AccessControlModule,
    ProjectsModule,
    TypeOrmModule.forFeature([PublishedProject]),
    UsersModule,
  ],
  controllers: [PublishProjectController, PublishedProjectReadController],
  providers: [
    PublishedProjectService,
    PublishedProjectCrudService,
    PublishedProjectSerializer,
  ],
})
export class PublishedProjectModule {}
