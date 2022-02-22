import { IEvent } from '@nestjs/cqrs';
import { ComponentId } from '@marxan/cloning/domain';
import { ImportId } from '../import/import.id';

export class PieceImported implements IEvent {
  constructor(
    public readonly importId: ImportId,
    public readonly componentId: ComponentId,
  ) {}
}
