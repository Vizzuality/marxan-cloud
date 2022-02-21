import { HttpModule, Module } from '@nestjs/common';
import { AccessControlModule } from '../access-control';
import { WebshotController } from './webshot.controller';
import { WebshotService } from './webshot.service';

@Module({
  imports: [HttpModule, AccessControlModule],
  providers: [WebshotService],
  controllers: [WebshotController],
  exports: [WebshotService],
})
export class WebshotModule {}
