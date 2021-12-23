import { Command } from '@nestjs-architects/typed-cqrs';
import { ExportId } from '../domain';

export { ExportId };

export class FinalizeArchive extends Command<void> {
  constructor(public readonly exportId: ExportId) {
    super();
  }
}
