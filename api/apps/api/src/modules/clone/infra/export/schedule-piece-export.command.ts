import { ExportId } from '@marxan-api/modules/clone/export/domain';
import { ComponentId } from '@marxan/cloning/domain';
import { Command } from '@nestjs-architects/typed-cqrs';

export class SchedulePieceExport extends Command<void> {
  constructor(
    public readonly exportId: ExportId,
    public readonly componentId: ComponentId,
  ) {
    super();
  }
}
