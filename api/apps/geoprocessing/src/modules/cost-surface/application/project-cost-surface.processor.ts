import { WorkerProcessor } from '@marxan-geoprocessing/modules/worker';
import { canPlanningUnitsBeLocked } from '@marxan/scenarios-planning-unit';
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { GetAvailablePlanningUnits } from '../ports/available-planning-units/get-available-planning-units';
import { PuExtractorPort } from '../ports/pu-extractor/pu-extractor.port';
import { ShapefileConverterPort } from '../ports/shapefile-converter/shapefile-converter.port';
import {
  FromProjectShapefileJobInput,
  InitialProjectCostInput,
  ProjectCostSurfaceJobInput,
} from '@marxan/artifact-cache/surface-cost-job-input';
import { CostSurfacePuDataEntity } from '@marxan/cost-surfaces';
import { TypeormProjectCostSurface } from '@marxan-geoprocessing/modules/cost-surface/adapters/project/typeorm-project-cost-surface';

@Injectable()
export class ProjectCostSurfaceProcessor
  implements WorkerProcessor<ProjectCostSurfaceJobInput, true> {
  constructor(
    private readonly repo: TypeormProjectCostSurface,
    private readonly puExtractor: PuExtractorPort,
    private readonly availablePlanningUnits: GetAvailablePlanningUnits,
    private readonly shapefileConverter: ShapefileConverterPort,
  ) {}

  private async fromShapefileProcessor(
    job: Job<FromProjectShapefileJobInput, true>,
  ): Promise<true> {
    const geoJson = await this.shapefileConverter.convert(job.data.shapefile);
    const costSurfaces = this.puExtractor.extract(geoJson);
    const projectPlanningUnits = await this.availablePlanningUnits.get(
      job.data.projectId,
    );
    const puids = projectPlanningUnits.map((spu) => spu.puid);

    const { errors } = canPlanningUnitsBeLocked(
      costSurfaces.map((cost) => cost.puid),
      puids,
    );
    if (errors.length > 0) {
      throw new Error(errors.join('.'));
    }
    const projectPlanningUnitsByPuid: Record<number, string> = {};
    projectPlanningUnits.forEach((record) => {
      projectPlanningUnitsByPuid[record.puid] = record.id;
    });
    await this.repo.save(
      costSurfaces.map(
        (record) =>
          ({
            cost: record.cost,
            puid: projectPlanningUnitsByPuid[record.puid],
            costSurfaceId: job.data.costSurfaceId,
          } as CostSurfacePuDataEntity),
      ),
    );

    return true;
  }

  private async initialCostProcessor({
    data: { projectId, costSurfaceId },
  }: Job<InitialProjectCostInput, true>): Promise<true> {
    await this.repo.generateInitialCostSurface(projectId, costSurfaceId);
    return true;
  }

  async process(job: Job<ProjectCostSurfaceJobInput, true>): Promise<true> {
    const { data } = job;
    if ((data as FromProjectShapefileJobInput).shapefile)
      return this.fromShapefileProcessor(
        job as Job<FromProjectShapefileJobInput, true>,
      );

    return this.initialCostProcessor(job as Job<InitialProjectCostInput, true>);
  }
}
