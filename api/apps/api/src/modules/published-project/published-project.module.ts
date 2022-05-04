import { forwardRef, Module } from '@nestjs/common';
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
import { WebshotModule } from '@marxan/webshot';
import { ScenariosModule } from '../scenarios/scenarios.module';
import { Scenario } from '../scenarios/scenario.api.entity';
import { ExportRepository } from '../clone/export/application/export-repository.port';
import { TypeormExportRepository } from '../clone/export/adapters/typeorm-export.repository';

@Module({
  imports: [
    AccessControlModule,
    ProjectsModule,
    TypeOrmModule.forFeature([PublishedProject, Scenario]),
    UsersModule,
    forwardRef(() => WebshotModule),
    ScenariosModule,
  ],
  controllers: [PublishProjectController, PublishedProjectReadController],
  providers: [
    PublishedProjectService,
    PublishedProjectCrudService,
    PublishedProjectSerializer,
    {
      provide: ExportRepository,
      useClass: TypeormExportRepository,
    },
  ],
})
export class PublishedProjectModule {}
