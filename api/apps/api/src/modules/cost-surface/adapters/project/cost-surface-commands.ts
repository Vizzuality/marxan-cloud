import { CostSurfaceCalculationPort } from '@marxan-api/modules/cost-surface/ports/project/cost-surface-calculation.port';
import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateProjectCostSurface } from '@marxan-api/modules/cost-surface/application/project/create-project-cost-surface.command';
import { Left } from 'fp-ts/lib/Either';
import { jobSubmissionFailed } from '@marxan/artifact-cache';
import { Right } from 'fp-ts/Either';

@Injectable()
export class CostSurfaceCalculation extends CostSurfaceCalculationPort {
  constructor(private readonly commandBus: CommandBus) {
    super();
  }

  async forShapefile(
    projectId: string,
    costSurfaceId: string,
    file: Express.Multer.File,
  ): Promise<Left<typeof jobSubmissionFailed> | Right<true>> {
    return this.commandBus.execute(
      new CreateProjectCostSurface(projectId, costSurfaceId, file),
    );
  }
}
