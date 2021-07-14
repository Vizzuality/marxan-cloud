import { Injectable } from '@nestjs/common';
import { ShapefileService } from '@marxan-geoprocessing/modules/shapefiles/shapefiles.service';

@Injectable()
export class FakeShapefileService
  implements Pick<ShapefileService, 'transformToGeoJson'> {
  transformToGeoJsonMock = jest.fn();

  async transformToGeoJson(
    shapeFile: Express.Multer.File,
  ): Promise<{ data: any }> {
    return this.transformToGeoJsonMock(shapeFile);
  }
}
