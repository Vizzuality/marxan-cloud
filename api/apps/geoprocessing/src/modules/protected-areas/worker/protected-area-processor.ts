import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { Job } from 'bullmq';

import { WorkerProcessor } from '../../worker';
import { ProtectedAreasJobInput } from './worker-input';
import { ShapefileService } from '@marxan/shapefile-converter';
import { ProtectedArea } from '../protected-areas.geo.entity';
import { GeoJSON } from 'geojson';
import { GeometryExtractor } from './geometry-extractor';

@Injectable()
export class ProtectedAreaProcessor
  implements WorkerProcessor<ProtectedAreasJobInput, void> {
  constructor(
    private readonly shapefileService: ShapefileService,
    private readonly geometryExtractor: GeometryExtractor,
    private connection: Connection,
  ) {}

  async process(job: Job<ProtectedAreasJobInput, void>): Promise<void> {
    const geo: GeoJSON = (
      await this.shapefileService.transformToGeoJson(job.data.file)
    ).data;

    const geometries = this.geometryExtractor.extract(geo);

    if (geometries.length === 0) {
      throw new Error(
        'No supported geometries found. Ensure that file contains FeatureCollection / Multipolygon / Polygon.',
      );
    }

    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.delete(ProtectedArea, {
        projectId: job.data.projectId,
      });
      await queryRunner.manager.insert(
        ProtectedArea,
        geometries.map((geometry) => ({
          projectId: job.data.projectId,
          fullName: job.data.file.filename,
          theGeom: () =>
            `st_multi(ST_GeomFromGeoJSON('${JSON.stringify(geometry)}'))`,
        })),
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
