import { Command } from '@nestjs-architects/typed-cqrs';
import { ComponentId, ComponentLocation } from '@marxan/cloning/domain';
import { ExportId } from '../domain';

export { ComponentId, ComponentLocation, ExportId };

export class CompletePiece extends Command<void> {
  constructor(
    public readonly exportId: ExportId,
    public readonly componentId: ComponentId,
    public readonly componentLocation: ComponentLocation[],
  ) {
    super();
  }
}
