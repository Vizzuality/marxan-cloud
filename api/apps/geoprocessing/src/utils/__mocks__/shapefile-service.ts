import { Injectable } from '@nestjs/common';

@Injectable()
export class FakeShapefileService {
  getGeoJsonMock = jest.fn();

  async getGeoJson(shapeFile: Express.Multer.File): Promise<{ data: any }> {
    return this.getGeoJsonMock(shapeFile);
  }
}
