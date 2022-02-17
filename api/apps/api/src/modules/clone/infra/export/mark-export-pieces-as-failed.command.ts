import { ComponentId } from '@marxan/cloning/domain';
import { Command } from '@nestjs-architects/typed-cqrs';
import { ExportId } from '../../export';

export class MarkExportPiecesAsFailed extends Command<void> {
  constructor(
    public readonly exportId: ExportId,
    public readonly componentsId: ComponentId[],
  ) {
    super();
  }
}
