import { Module } from '@nestjs/common';
import { LegacyService } from './legacy-service';
import { ThirdPartyService } from './third-party-service';
import { Facade } from './facade';
import { SomeController } from './controller';
import { Serializer } from './serializer';

@Module({
  providers: [LegacyService, ThirdPartyService, Facade, Serializer],
  controllers: [SomeController],
  exports: [Facade],
})
export class BaseModule {}
