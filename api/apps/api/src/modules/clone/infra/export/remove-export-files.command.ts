import { Command } from '@nestjs-architects/typed-cqrs';
import { ExportId } from '@marxan-api/modules/clone';

export class RemoveExportFiles extends Command<void> {
  constructor(public readonly exportId: ExportId) {
    super();
  }
}
