import { ExportId } from '@marxan-api/modules/clone';
import { Command } from '@nestjs-architects/typed-cqrs';

export class MarkExportAsFailed extends Command<void> {
  constructor(
    public readonly exportId: ExportId,
    public readonly reason?: string,
  ) {
    super();
  }
}
