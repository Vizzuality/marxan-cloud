import { Command } from '@nestjs-architects/typed-cqrs';
import { Either } from 'fp-ts/Either';
import { SpecificationInput } from './specification-input';

export const internalError = Symbol(`internal error`);

export type SubmitSpecificationError = typeof internalError;

export class SubmitSpecification extends Command<
  Either<SubmitSpecificationError, string>
> {
  constructor(public readonly payload: SpecificationInput) {
    super();
  }
}
