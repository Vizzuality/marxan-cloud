import { Command } from '@nestjs-architects/typed-cqrs';
import { Either } from 'fp-ts/lib/Either';
import { LinkCostSurfaceToScenarioMode } from '@marxan/artifact-cache/surface-cost-job-input';

export const linkCostSurfaceToScenarioFailed = Symbol(
  'link surface cost to scenario failed',
);

export type LinkCostSurfaceToScenarioError =
  typeof linkCostSurfaceToScenarioFailed;

export type LinkCostSurfaceToScenarioResponse = Either<
  LinkCostSurfaceToScenarioError,
  true
>;

/**
 * @todo: Temporal substitute for UpdateCostSurface command, which works at scenario level. It should be
 *        removed and use there once the implementation is fully validated
 */
export class LinkCostSurfaceToScenarioCommand extends Command<LinkCostSurfaceToScenarioResponse> {
  constructor(
    public readonly scenarioId: string,
    public readonly costSurfaceId: string,
    public readonly mode: LinkCostSurfaceToScenarioMode,
  ) {
    super();
  }
}
