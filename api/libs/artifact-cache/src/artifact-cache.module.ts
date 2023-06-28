import { DynamicModule, Module } from '@nestjs/common';
import { getEntityManagerToken, TypeOrmModule } from '@nestjs/typeorm';
import { ProjectTemplateFileCache } from './artifact-cache.api.entity';
import {
  EntityManagerToken,
  ArtifactCacheRepository,
} from './artifact-cache.repository';

@Module({})
export class ArtifactCacheModule {
  static for(connectionName?: string): DynamicModule {
    return {
      module: ArtifactCacheModule,
      imports: [
        TypeOrmModule.forFeature([ProjectTemplateFileCache], connectionName),
      ],
      providers: [
        ArtifactCacheRepository,
        {
          provide: EntityManagerToken,
          useExisting: getEntityManagerToken(connectionName),
        },
      ],
      exports: [ArtifactCacheRepository],
    };
  }
}
