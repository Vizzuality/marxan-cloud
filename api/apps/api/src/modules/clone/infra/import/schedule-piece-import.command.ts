import { ImportId } from '@marxan-api/modules/clone/import/domain';
import { ComponentId } from '@marxan/cloning/domain';
import { Command } from '@nestjs-architects/typed-cqrs';

export class SchedulePieceImport extends Command<void> {
  constructor(
    public readonly importId: ImportId,
    public readonly componentId: ComponentId,
  ) {
    super();
  }
}
