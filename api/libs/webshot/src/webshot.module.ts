import { HttpModule, Module } from '@nestjs/common';
import { WebshotService } from './webshot.service';

@Module({
  imports: [HttpModule],
  providers: [WebshotService],
  controllers: [],
  exports: [WebshotService],
})
export class WebshotModule {}
