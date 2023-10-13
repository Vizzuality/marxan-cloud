import { Injectable } from '@nestjs/common';
import { ShapefileService } from '@marxan/shapefile-converter';

@Injectable()
export class FakeShapefileService
  implements Pick<ShapefileService, 'transformToGeoJson'>
{
  transformToGeoJsonMock = jest.fn();

  async transformToGeoJson(
    shapeFile: Express.Multer.File,
  ): Promise<{ data: any }> {
    return this.transformToGeoJsonMock(shapeFile);
  }
}
