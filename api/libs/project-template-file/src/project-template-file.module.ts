import { DynamicModule, Module } from '@nestjs/common';
import { getEntityManagerToken, TypeOrmModule } from '@nestjs/typeorm';
import { ProjectTemplateFileCache } from './project-template-file-cache.api.entity';
import {
  EntityManagerToken,
  ProjectTemplateFileRepository,
} from './project-template-file.repository';

@Module({})
export class ProjectTemplateFileModule {
  static for(connectionName?: string): DynamicModule {
    return {
      module: ProjectTemplateFileModule,
      imports: [
        TypeOrmModule.forFeature([ProjectTemplateFileCache], connectionName),
      ],
      providers: [
        ProjectTemplateFileRepository,
        {
          provide: EntityManagerToken,
          useExisting: getEntityManagerToken(connectionName),
        },
      ],
      exports: [ProjectTemplateFileRepository],
    };
  }
}
