import { Injectable } from '@nestjs/common';
import { CostSurfaceRepo } from './cost-surface-repo';
import { ArePuidsAllowedPort } from '../shared/are-puids-allowed.port';
import { AdjustCostSurface } from '../../entry-points/adjust-cost-surface';
import { CostSurfaceInputDto } from '../../entry-points/adjust-cost-surface-input';

type Success = true;

@Injectable()
export class UpdateCostSurfaceService implements AdjustCostSurface {
  constructor(
    private readonly puUuidValidator: ArePuidsAllowedPort,
    private readonly repository: CostSurfaceRepo,
  ) {}

  async update(
    scenarioId: string,
    constraints: CostSurfaceInputDto,
  ): Promise<Success> {
    const targetPuIds = constraints.planningUnits.map((pu) => pu.id);

    if (targetPuIds.length > 0) {
      const { errors } = await this.puUuidValidator.validate(
        scenarioId,
        targetPuIds,
      );
      if (errors.length > 0) {
        throw new Error(
          'One or more of the planning units provided cost surface does not match any planning unit of the present scenario.',
        );
      }
    }

    await this.repository.applyCostSurface(
      scenarioId,
      constraints.planningUnits,
    );

    return true;
  }
}
