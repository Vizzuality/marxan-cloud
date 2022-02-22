import { IEvent } from '@nestjs/cqrs';
import { ImportId } from '../import/import.id';

export class AllPiecesImported implements IEvent {
  constructor(public readonly importId: ImportId) {}
}
