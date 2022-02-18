import { ComponentId } from '@marxan/cloning/domain';
import { IEvent } from '@nestjs/cqrs';
import { ImportId } from '../import/import.id';

export class PieceImportRequested implements IEvent {
  constructor(
    public readonly importId: ImportId,
    public readonly componentId: ComponentId,
  ) {}
}
