import { Injectable } from '@nestjs/common';
import { GeoJSON } from 'geojson';
import { pick } from 'lodash';
import { SaveGeoJsonResult } from '@marxan/planning-area-repository';
import { MarxanGeoJson } from './marxan-geo-json';
import { PlanningAreaDto } from './planning-area.dto';

@Injectable()
export class PlanningAreaSerializer {
  serialize(
    input: {
      id: string;
      data: GeoJSON;
    } & SaveGeoJsonResult,
  ) {
    const marxanGeoJSON = new MarxanGeoJson(
      input.data,
      input.bbox,
      pick(input, 'maxPuAreaSize', 'minPuAreaSize'),
    );
    const dtoData: PlanningAreaDto = {
      id: input.id,
      data: marxanGeoJSON.toJSON(),
    };
    const dtoInstance = new PlanningAreaDto();
    Object.assign(dtoInstance, dtoData);
    return dtoInstance;
  }
}
