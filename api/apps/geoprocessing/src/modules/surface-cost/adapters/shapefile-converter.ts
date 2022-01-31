import { FromShapefileJobInput } from '@marxan/scenarios-planning-unit';
import { ShapefileService } from '@marxan/shapefile-converter';
import { Injectable } from '@nestjs/common';
import { GeoJSON } from 'geojson';
import { ShapefileConverterPort } from '../ports/shapefile-converter/shapefile-converter.port';

@Injectable()
export class ShapefileConverter implements ShapefileConverterPort {
  constructor(private readonly converter: ShapefileService) {}

  async convert(file: FromShapefileJobInput['shapefile']): Promise<GeoJSON> {
    return (await this.converter.transformToGeoJson(file)).data;
  }
}
