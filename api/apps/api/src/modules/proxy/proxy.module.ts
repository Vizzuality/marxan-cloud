import { ConsoleLogger, Module } from '@nestjs/common';
import { ProxyService } from './proxy.service';

export const logger = new ConsoleLogger('ProxyService');

@Module({
  imports: [],
  providers: [ProxyService],
  exports: [],
})
export class ProxyModule {}
