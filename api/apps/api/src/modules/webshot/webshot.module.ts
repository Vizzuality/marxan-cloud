import { HttpModule, Module } from '@nestjs/common';
import { ScenariosModule } from '@marxan-api/modules/scenarios/scenarios.module';
import { WebshotController } from './webshot.controller';
import { WebshotService } from './webshot.service';

@Module({
  imports: [HttpModule, ScenariosModule],
  providers: [WebshotService],
  controllers: [WebshotController],
  exports: [WebshotService],
})
export class WebshotModule {}
