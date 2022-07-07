import { Command } from '@nestjs-architects/typed-cqrs';
import { Either } from 'fp-ts/lib/Either';

export const deleteScenarioFailed = Symbol('delete-scenario-failed');

export type DeleteScenarioFailed = typeof deleteScenarioFailed;

export type DeleteScenarioResponse = Either<DeleteScenarioFailed, true>;

export class DeleteScenario extends Command<DeleteScenarioResponse> {
  constructor(public readonly scenarioId: string) {
    super();
  }
}
