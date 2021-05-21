import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Job } from 'bullmq';

import { WorkerProcessor } from '../../worker';
import { ProtectedAreasJobInput } from './worker-input';
import { ShapefileService } from '../../shapefiles/shapefiles.service';
import { ProtectedArea } from '../protected-areas.geo.entity';
import { FeatureCollection, MultiPolygon } from 'geojson';

@Injectable()
export class ProtectedAreaProcessor
  implements WorkerProcessor<ProtectedAreasJobInput, void> {
  constructor(
    private readonly shapefileService: ShapefileService,
    @InjectRepository(ProtectedArea)
    private readonly protectedAreasRepository: Repository<ProtectedArea>,
  ) {}

  async process(job: Job<ProtectedAreasJobInput, void>): Promise<void> {
    const geo = (await this.shapefileService.getGeoJson(job.data.file)).data;
    console.log(geo);
    // const polys = geo.features.map((f) => f.geometry);
    // console.log(`--- polys`, polys);
    // ST_Multi
    const res = await this.protectedAreasRepository
      .update(
        {
          projectId: job.data.projectId,
        },
        {
          fullName: job.data.file.filename,
          theGeom: {
            type: 'MultiPolygon',
            coordinates: [],
          },
        },
      )
      .catch((error) => {
        console.log(`db error`);
        throw error;
      });

    console.log(new Date(), `db ok..`, res);
  }
}
