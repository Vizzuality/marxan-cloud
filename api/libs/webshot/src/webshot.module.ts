import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WebshotService } from './webshot.service';

@Module({
  imports: [HttpModule],
  providers: [WebshotService],
  controllers: [],
  exports: [WebshotService],
})
export class WebshotModule {}
