import { Command } from '@nestjs-architects/typed-cqrs';
import { ImportId } from '../../import/domain';

export class MarkImportAsFailed extends Command<void> {
  constructor(
    public readonly importId: ImportId,
    public readonly reason?: string,
  ) {
    super();
  }
}
