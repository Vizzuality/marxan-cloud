import {
  ClonePiece,
  ComponentId,
  ComponentLocation,
  ResourceId,
} from '@marxan/cloning/domain';
import { v4 } from 'uuid';
import { ImportComponentSnapshot } from '@marxan-api/modules/clone/import';

export class ImportComponent {
  private constructor(
    readonly id: ComponentId,
    readonly piece: ClonePiece,
    readonly resourceId: ResourceId,
    readonly order: number,
    readonly uris: ComponentLocation[],
    private finished: boolean = false,
  ) {}

  static from(snapshot: ImportComponentSnapshot) {
    return new ImportComponent(
      snapshot.id,
      snapshot.piece,
      snapshot.resourceId,
      snapshot.order,
      snapshot.uris,
      snapshot.finished,
    );
  }

  static newOne(
    resourceId: ResourceId,
    piece: ClonePiece,
    order: number,
    uris: ComponentLocation[],
  ): ImportComponent {
    return new ImportComponent(
      new ComponentId(v4()),
      piece,
      resourceId,
      order,
      uris,
    );
  }

  isFinished() {
    return this.finished;
  }

  complete() {
    this.finished = true;
  }

  toSnapshot(): ImportComponentSnapshot {
    return {
      id: this.id,
      order: this.order,
      finished: this.finished,
      piece: this.piece,
      resourceId: this.resourceId,
      uris: this.uris,
    };
  }
}
