import { Logger, Module } from '@nestjs/common';
import { AccessControlModule } from '@marxan-api/modules/access-control';
import { ProxyService } from './proxy.service';

export const logger = new Logger('ProxyService');

@Module({
  imports: [AccessControlModule],
  providers: [ProxyService],
  exports: [],
})
export class ProxyModule {}
