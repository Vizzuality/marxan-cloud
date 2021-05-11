import { Logger, Module } from '@nestjs/common';
import { ProxyController } from './proxy.controller';
import { ProxyService } from './proxy.service';

export const logger = new Logger('ProxyService');

@Module({
  imports: [],
  controllers: [ProxyController],
  providers: [ProxyService],
  exports: [],
})
export class ProxyModule {}
