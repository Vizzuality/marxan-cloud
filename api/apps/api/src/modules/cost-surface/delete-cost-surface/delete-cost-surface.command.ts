import { Command } from '@nestjs-architects/typed-cqrs';
import { Either } from 'fp-ts/lib/Either';

export const deleteCostSurfaceFailed = Symbol('delete-cost-surface-failed');

export type DeleteCostSurfaceFailed = typeof deleteCostSurfaceFailed;

export type DeleteCostSurfaceResponse = Either<DeleteCostSurfaceFailed, true>;

export class DeleteCostSurfaceCommand extends Command<DeleteCostSurfaceResponse> {
  constructor(public readonly costSurfaceId: string) {
    super();
  }
}
