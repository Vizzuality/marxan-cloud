import { Injectable, Logger } from '@nestjs/common';
import { GeoJSON } from 'geojson';
import * as uuid from 'uuid';
import { CustomPlanningAreaRepository } from '@marxan/planning-area-repository';
import { ShapefileService } from '@marxan/shapefile-converter';
import { SaveGeoJsonResult } from '@marxan/planning-area-repository/custom-planning-area.repository';
import { PlanningAreaGarbageCollector } from './planning-area-garbage-collector.service';

@Injectable()
export class PlanningAreaService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly repository: CustomPlanningAreaRepository,
    private readonly shapefileService: ShapefileService,
    private readonly planningAreaGarbageCollector: PlanningAreaGarbageCollector,
  ) {}

  async save(
    shapefile: Express.Multer.File,
  ): Promise<{ data: GeoJSON } & SaveGeoJsonResult> {
    const { data } = await this.shapefileService.transformToGeoJson(shapefile);
    const result = await this.repository.saveGeoJson(data);
    this.scheduleGarbageCollection();
    return {
      ...result,
      data,
    };
  }

  private scheduleGarbageCollection() {
    setTimeout(async () => {
      const gcId = uuid.v4();
      this.logger.log(`garbage collection ${gcId} scheduled`);
      await this.planningAreaGarbageCollector.collectGarbage();
      this.logger.log(`garbage collection ${gcId} finished`);
    });
  }
}
