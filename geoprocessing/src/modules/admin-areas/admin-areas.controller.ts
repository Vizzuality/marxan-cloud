import { Controller, Get} from '@nestjs/common';
// import { AdminAreasResult } from './admin-areas.geo.entity';
import { AdminAreasService } from './admin-areas.service';
import { apiGlobalPrefixes } from 'api.config';

@Controller(`${apiGlobalPrefixes.v1}`)
export class AdminAreasController {
  constructor( public service: AdminAreasService) {}

  @Get('/test')
  async getTest(): Promise<void> {
    await this.service.findTest()
  }

}
