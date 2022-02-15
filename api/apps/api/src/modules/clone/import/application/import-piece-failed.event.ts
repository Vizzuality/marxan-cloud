import { ComponentId } from '@marxan/cloning/domain';
import { IEvent } from '@nestjs/cqrs';
import { ImportId } from '../domain';

export class ImportPieceFailed implements IEvent {
  constructor(
    public readonly importId: ImportId,
    public readonly componentId: ComponentId,
  ) {}
}
