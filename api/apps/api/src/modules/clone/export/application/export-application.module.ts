import { DynamicModule, Module, ModuleMetadata } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { ExportProjectHandler } from './export-project.handler';

@Module({})
export class ExportApplicationModule {
  static for(adapters: ModuleMetadata['imports']): DynamicModule {
    return {
      module: ExportApplicationModule,
      imports: [CqrsModule, ...(adapters ?? [])],
      providers: [ExportProjectHandler],
      exports: [],
    };
  }
}
