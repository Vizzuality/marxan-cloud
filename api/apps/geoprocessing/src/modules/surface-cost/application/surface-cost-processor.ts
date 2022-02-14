import { WorkerProcessor } from '@marxan-geoprocessing/modules/worker';
import {
  FromShapefileJobInput,
  InitialCostJobInput,
  JobInput,
} from '@marxan/scenario-cost-surface';
import {
  canPlanningUnitsBeLocked,
  PlanningUnitGridShape,
} from '@marxan/scenarios-planning-unit';
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
      surfaceCosts.map((cost) => cost.puUuid),
      scenarioPlanningUnitIds,
    );
    if (errors.length > 0) {
      throw new Error(errors.join('.'));
    }
    await this.repo.save(job.data.scenarioId, surfaceCosts);

    return true;
  }

  private async initialCostProcessor({
    data: { scenarioId, puGridShape },
  }: Job<InitialCostJobInput, true>): Promise<true> {
    const hexagonPuShape = puGridShape === PlanningUnitGridShape.hexagon;
    const squarePuShape = puGridShape === PlanningUnitGridShape.square;

    if (hexagonPuShape || squarePuShape) {
      const { ids: puIds } = await this.availablePlanningUnits.get(scenarioId);

      await this.repo.save(
        scenarioId,
        puIds.map((id) => ({ puUuid: id, cost: 1 })),
      );
      return true;
    }

    const pusWithArea = await this.availablePlanningUnits.getPUsWithArea(
      scenarioId,
    );

    const referenceArea = await this.availablePlanningUnits.getMaxPUAreaForScenario(
      scenarioId,
    );

    await this.repo.save(
      scenarioId,
      pusWithArea.map(({ id, area }) => ({
        puUuid: id,
        cost: Math.round((area * 100) / referenceArea) / 100,
      })),
    );

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
