import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';

import { canPlanningUnitsBeLocked } from '@marxan/scenarios-planning-unit';
import { WorkerProcessor } from '@marxan-geoprocessing/modules/worker';

import { CostSurfaceJobInput } from '../cost-surface-job-input';

import { CostSurfacePersistencePort } from '../ports/persistence/cost-surface-persistence.port';
import { PuExtractorPort } from '../ports/pu-extractor/pu-extractor.port';
import { GetAvailablePlanningUnits } from '../ports/available-planning-units/get-available-planning-units';
import { ShapefileConverterPort } from '../ports/shapefile-converter/shapefile-converter.port';

@Injectable()
export class SurfaceCostProcessor
  implements WorkerProcessor<CostSurfaceJobInput, true> {
  constructor(
    private readonly repo: CostSurfacePersistencePort,
    private readonly puExtractor: PuExtractorPort,
    private readonly availablePlanningUnits: GetAvailablePlanningUnits,
    private readonly shapefileConverter: ShapefileConverterPort,
  ) {}

  async process(job: Job<CostSurfaceJobInput, true>): Promise<true> {
    const geoJson = await this.shapefileConverter.convert(job.data.shapefile);
    const surfaceCosts = this.puExtractor.extract(geoJson);
    const scenarioPlanningUnitIds = (
      await this.availablePlanningUnits.get(job.data.scenarioId)
    ).ids;
    const { errors } = canPlanningUnitsBeLocked(
      surfaceCosts.map((cost) => cost.puid),
      scenarioPlanningUnitIds,
    );
    if (errors.length > 0) {
      throw new Error(errors.join('.'));
    }
    await this.repo.save(job.data.scenarioId, surfaceCosts);
    return true;
  }
}
