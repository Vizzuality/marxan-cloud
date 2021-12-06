import { v4 } from 'uuid';
import { ClonePiece } from '@marxan/cloning/domain';

import { ResourceId } from '../../../../shared-kernel/resource.id';
import { ExportComponentSnapshot } from '../export-component.snapshot';

import { ComponentId } from '../../../../shared-kernel/component.id';
import { ComponentLocation } from '../../../../shared-kernel/component-location';

export class ExportComponent {
  private constructor(
    readonly id: ComponentId,
    readonly piece: ClonePiece,
    readonly resourceId: ResourceId,
    private finished: boolean = false,
    private uri?: ComponentLocation,
  ) {}

  static newOne(resourceId: ResourceId, piece: ClonePiece): ExportComponent {
    return new ExportComponent(new ComponentId(v4()), piece, resourceId);
  }

  finish(location: ComponentLocation) {
    this.finished = true;
    this.uri = location;
  }

  isReady() {
    return this.finished;
  }

  toSnapshot(): ExportComponentSnapshot {
    return {
      id: this.id,
      piece: this.piece,
      resourceId: this.resourceId.value,
      finished: this.finished,
      uri: this.uri?.value,
    };
  }

  static fromSnapshot(snapshot: ExportComponentSnapshot) {
    return new ExportComponent(
      snapshot.id,
      snapshot.piece,
      new ResourceId(snapshot.resourceId),
      snapshot.finished,
      snapshot.uri ? new ComponentLocation(snapshot.uri) : undefined,
    );
  }
}
