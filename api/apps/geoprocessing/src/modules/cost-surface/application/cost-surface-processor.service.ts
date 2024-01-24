import { WorkerProcessor } from '@marxan-geoprocessing/modules/worker';
import {
  FromShapefileJobInput,
  InitialCostJobInput,
  JobInput,
} from '@marxan/artifact-cache';
import { canPlanningUnitsBeLocked } from '@marxan/scenarios-planning-unit';
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { GetAvailablePlanningUnits } from '../ports/available-planning-units/get-available-planning-units';
import { CostSurfacePersistencePort } from '../ports/persistence/cost-surface-persistence.port';
import { PuExtractorPort } from '../ports/pu-extractor/pu-extractor.port';
import { ShapefileConverterPort } from '../ports/shapefile-converter/shapefile-converter.port';

@Injectable()
export class CostSurfaceProcessor implements WorkerProcessor<JobInput, true> {
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
    const costSurfaces = this.puExtractor.extract(geoJson);
    const scenarioPlanningUnits = await this.availablePlanningUnits.get(
      job.data.scenarioId,
    );
    const puids = scenarioPlanningUnits.map((spu) => spu.puid);

    const { errors } = canPlanningUnitsBeLocked(
      costSurfaces.map((cost) => cost.puid),
      puids,
    );
    if (errors.length > 0) {
      throw new Error(errors.join('.'));
    }

    const scenarioPlanningUnitIdByPuid: Record<number, string> = {};
    scenarioPlanningUnits.forEach((record) => {
      scenarioPlanningUnitIdByPuid[record.puid] = record.id;
    });

    await this.repo.save(
      costSurfaces.map((record) => ({
        cost: record.cost,
        id: scenarioPlanningUnitIdByPuid[record.puid],
      })),
    );

    return true;
  }

  private async initialCostProcessor({
    // Requires scenario id!!!!!!!!!!!!
    data: { scenarioId },
  }: Job<InitialCostJobInput, true>): Promise<true> {
    await this.repo.generateInitialCostSurface(scenarioId);

    return true;
  }

  async process(job: Job<JobInput, true>): Promise<true> {
    const { data } = job;

    if ((data as FromShapefileJobInput).shapefile)
      return this.fromShapefileProcessor(
        job as Job<FromShapefileJobInput, true>,
      );

    return this.initialCostProcessor(job as Job<InitialCostJobInput, true>);
  }
}
