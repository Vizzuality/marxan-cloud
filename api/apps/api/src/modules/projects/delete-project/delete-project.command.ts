import { Command } from '@nestjs-architects/typed-cqrs';
import { Either } from 'fp-ts/lib/Either';

export const deleteProjectFailed = Symbol('delete-project-failed');

export type DeleteProjectFailed = typeof deleteProjectFailed;

export type DeleteProjectResponse = Either<DeleteProjectFailed, true>;

export class DeleteProject extends Command<DeleteProjectResponse> {
  constructor(public readonly projectId: string) {
    super();
  }
}
