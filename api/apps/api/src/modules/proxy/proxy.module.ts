import { Logger, Module } from '@nestjs/common';
import { ProxyService } from './proxy.service';

export const logger = new Logger('ProxyService');

@Module({
  imports: [],
  providers: [ProxyService],
  exports: [],
})
export class ProxyModule {}
