import { Injectable } from '@nestjs/common';
import { GeoJSON } from 'geojson';
import { CustomPlanningAreaRepository } from '@marxan/planning-area-repository';
import { ShapefileService } from '@marxan-geoprocessing/modules/shapefiles/shapefiles.service';

@Injectable()
export class PlanningAreaService {
  constructor(
    private readonly repository: CustomPlanningAreaRepository,
    private readonly shapefileService: ShapefileService,
  ) {}

  async save(
    shapefile: Express.Multer.File,
  ): Promise<{ data: GeoJSON; id: string }> {
    const { data } = await this.shapefileService.transformToGeoJson(shapefile);
    const result = await this.repository.saveGeoJson(data);
    return {
      id: result[0].id,
      data,
    };
  }
}
