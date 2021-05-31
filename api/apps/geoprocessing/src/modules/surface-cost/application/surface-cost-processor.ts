import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';

import { WorkerProcessor } from '../../worker';
import { CostSurfaceJobInput } from '../cost-surface-job-input';

import { CostSurfacePersistencePort } from '../ports/persistence/cost-surface-persistence.port';
import { PuExtractorPort } from '../ports/pu-extractor/pu-extractor.port';
import { ArePuidsAllowedPort } from '../ports/pu-validator/are-puuids-allowed.port';
import { ShapefileConverterPort } from '../ports/shapefile-converter/shapefile-converter.port';

@Injectable()
export class SurfaceCostProcessor
  implements WorkerProcessor<CostSurfaceJobInput, true> {
  constructor(
    private readonly repo: CostSurfacePersistencePort,
    private readonly puExtractor: PuExtractorPort,
    private readonly puValidator: ArePuidsAllowedPort,
    private readonly shapefileConverter: ShapefileConverterPort,
  ) {}

  async process(job: Job<CostSurfaceJobInput, true>): Promise<true> {
    const geoJson = await this.shapefileConverter.convert(job.data.shapefile);
    const surfaceCosts = this.puExtractor.extract(geoJson);
    const { errors } = await this.puValidator.validate(
      job.data.scenarioId,
      surfaceCosts.map((cost) => cost.planningUnitId),
    );
    if (errors.length > 0) {
      throw new Error(errors.join('.'));
    }
    await this.repo.save(job.data.scenarioId, surfaceCosts);
    return true;
  }
}
