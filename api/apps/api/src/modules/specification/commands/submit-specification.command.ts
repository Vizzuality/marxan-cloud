import { Command } from '@nestjs-architects/typed-cqrs';
import { SpecificationInput } from './specification-input';

export class SubmitSpecification extends Command<string> {
  constructor(public readonly payload: SpecificationInput) {
    super();
  }
}
