import {
  CommandHandler,
  EventBus,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { left, right } from 'fp-ts/lib/Either';
import { Repository } from 'typeorm';
import { CostSurface } from '@marxan-api/modules/cost-surface/cost-surface.api.entity';
import {
  DeleteCostSurfaceCommand,
  deleteCostSurfaceFailed,
  DeleteCostSurfaceResponse,
} from '@marxan-api/modules/cost-surface/delete-cost-surface/delete-cost-surface.command';
import { CostSurfaceDeleted } from '@marxan-api/modules/cost-surface/events/cost-surface-deleted.event';

@CommandHandler(DeleteCostSurfaceCommand)
export class DeleteCostSurfaceHandler
  implements IInferredCommandHandler<DeleteCostSurfaceCommand> {
  constructor(
    @InjectRepository(CostSurface)
    private readonly costSurfaceRepo: Repository<CostSurface>,
    private readonly eventBus: EventBus,
  ) {}

  async execute({
    costSurfaceId,
  }: DeleteCostSurfaceCommand): Promise<DeleteCostSurfaceResponse> {
    try {
      await this.costSurfaceRepo.delete(costSurfaceId);

      this.eventBus.publish(new CostSurfaceDeleted(costSurfaceId));

      return right(true);
    } catch (error) {
      return left(deleteCostSurfaceFailed);
    }
  }
}
