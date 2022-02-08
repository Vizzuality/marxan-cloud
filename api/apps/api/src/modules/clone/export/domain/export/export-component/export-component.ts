import { v4 } from 'uuid';
import {
  ClonePiece,
  ComponentId,
  ComponentLocation,
  ResourceId,
} from '@marxan/cloning/domain';

import { ExportComponentSnapshot } from '../export-component.snapshot';

export class ExportComponent {
  private constructor(
    readonly id: ComponentId,
    readonly piece: ClonePiece,
    readonly resourceId: ResourceId,
    private finished: boolean = false,
    private uris: ComponentLocation[] = [],
  ) {}

  static newOne(resourceId: ResourceId, piece: ClonePiece): ExportComponent {
    return new ExportComponent(new ComponentId(v4()), piece, resourceId);
  }

  finish(location: ComponentLocation[]) {
    this.finished = true;
    this.uris = location;
  }

  isReady() {
    return this.finished;
  }

  toSnapshot(): ExportComponentSnapshot {
    return {
      id: this.id.value,
      piece: this.piece,
      resourceId: this.resourceId.value,
      finished: this.finished,
      uris: this.uris,
    };
  }

  static fromSnapshot(snapshot: ExportComponentSnapshot) {
    return new ExportComponent(
      new ComponentId(snapshot.id),
      snapshot.piece,
      new ResourceId(snapshot.resourceId),
      snapshot.finished,
      snapshot.uris.map(ComponentLocation.fromSnapshot),
    );
  }
}
