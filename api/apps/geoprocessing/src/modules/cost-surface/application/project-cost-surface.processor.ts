import { WorkerProcessor } from '@marxan-geoprocessing/modules/worker';
import { canPlanningUnitsBeLocked } from '@marxan/scenarios-planning-unit';
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { GetAvailablePlanningUnits } from '../ports/available-planning-units/get-available-planning-units';
import { PuExtractorPort } from '../ports/pu-extractor/pu-extractor.port';
import { ShapefileConverterPort } from '../ports/shapefile-converter/shapefile-converter.port';
import {
  FromProjectShapefileJobInput,
  ProjectCostSurfaceJobInput,
} from '@marxan/artifact-cache/surface-cost-job-input';
import { CostSurfacePuDataEntity } from '@marxan/cost-surfaces';
import { ProjectCostSurfacePersistencePort } from '@marxan-geoprocessing/modules/cost-surface/ports/persistence/project-cost-surface-persistence.port';

@Injectable()
export class ProjectCostSurfaceProcessor
  implements WorkerProcessor<ProjectCostSurfaceJobInput, true>
{
  constructor(
    private readonly repo: ProjectCostSurfacePersistencePort,
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
            projectsPuId: projectPlanningUnitsByPuid[record.puid],
            cost: record.cost,
            costSurfaceId: job.data.costSurfaceId,
          }) as CostSurfacePuDataEntity,
      ),
    );
    await this.repo.updateCostSurfaceRange(job.data.costSurfaceId);
    return true;
  }

  async process(job: Job<ProjectCostSurfaceJobInput, true>): Promise<true> {
    return this.fromShapefileProcessor(
      job as Job<FromProjectShapefileJobInput>,
    );
  }
}
