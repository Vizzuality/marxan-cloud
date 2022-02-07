import { WorkerProcessor } from '@marxan-geoprocessing/modules/worker';
import {
  FromShapefileJobInput,
  InitialCostJobInput,
  JobInput,
} from '@marxan/scenario-cost-surface';
import { canPlanningUnitsBeLocked } from '@marxan/scenarios-planning-unit';
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { GetAvailablePlanningUnits } from '../ports/available-planning-units/get-available-planning-units';
import { CostSurfacePersistencePort } from '../ports/persistence/cost-surface-persistence.port';
import { PuExtractorPort } from '../ports/pu-extractor/pu-extractor.port';
import { ShapefileConverterPort } from '../ports/shapefile-converter/shapefile-converter.port';

@Injectable()
export class SurfaceCostProcessor implements WorkerProcessor<JobInput, true> {
  constructor(
    private readonly repo: CostSurfacePersistencePort,
    private readonly puExtractor: PuExtractorPort,
    private readonly availablePlanningUnits: GetAvailablePlanningUnits,
    private readonly shapefileConverter: ShapefileConverterPort,
  ) {}

  private async fromShapefileProcessor(
    job: Job<FromShapefileJobInput, true>,
  ): Promise<true> {
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

  private async initialCostProcessor(
    job: Job<InitialCostJobInput, true>,
  ): Promise<true> {
    // TODO

    return true;
  }

  async process(job: Job<JobInput, true>): Promise<true> {
    const { data } = job;

    if ((data as FromShapefileJobInput).shapefile)
      return this.fromShapefileProcessor(
        job as Job<FromShapefileJobInput, true>,
      );
    if ((data as InitialCostJobInput).puGridShape)
      return this.initialCostProcessor(job as Job<InitialCostJobInput, true>);

    throw new Error('Unknown type of job');
  }
}
