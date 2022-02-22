import { Command } from '@nestjs-architects/typed-cqrs';
import { ComponentId, ComponentLocation } from '@marxan/cloning/domain';
import { ExportId } from '../domain';

export class CompleteExportPiece extends Command<void> {
  constructor(
    public readonly exportId: ExportId,
    public readonly componentId: ComponentId,
    public readonly componentLocation: ComponentLocation[],
  ) {
    super();
  }
}
