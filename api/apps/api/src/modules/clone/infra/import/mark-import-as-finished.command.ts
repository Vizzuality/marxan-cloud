import { Command } from '@nestjs-architects/typed-cqrs';
import { ImportId } from '../../import/domain';

export class MarkImportAsFinished extends Command<void> {
  constructor(public readonly importId: ImportId) {
    super();
  }
}
