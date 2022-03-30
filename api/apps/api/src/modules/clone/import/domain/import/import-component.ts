import {
  ClonePiece,
  ComponentId,
  ComponentLocation,
  ResourceId,
} from '@marxan/cloning/domain';
import { ImportComponentSnapshot } from '../import/import-component.snapshot';
import {
  ImportComponentStatus,
  ImportComponentStatuses,
} from './import-component-status';

export class ImportComponent {
  private constructor(
    readonly id: ComponentId,
    readonly piece: ClonePiece,
    readonly resourceId: ResourceId,
    readonly order: number,
    readonly uris: ComponentLocation[],
    private status: ImportComponentStatus = ImportComponentStatus.create(),
  ) {}

  static fromSnapshot(snapshot: ImportComponentSnapshot) {
    return new ImportComponent(
      new ComponentId(snapshot.id),
      snapshot.piece,
      new ResourceId(snapshot.resourceId),
      snapshot.order,
      snapshot.uris.map(ComponentLocation.fromSnapshot),
      new ImportComponentStatus(snapshot.status),
    );
  }

  static newOne(
    resourceId: ResourceId,
    piece: ClonePiece,
    order: number,
    uris: ComponentLocation[],
  ): ImportComponent {
    return new ImportComponent(
      ComponentId.create(),
      piece,
      resourceId,
      order,
      uris,
    );
  }

  isReady() {
    return this.status.value === ImportComponentStatuses.Completed;
  }

  hasFailed() {
    return this.status.value === ImportComponentStatuses.Failed;
  }

  complete() {
    this.status.markAsCompleted();
  }

  markAsFailed() {
    this.status.markAsFailed();
  }

  toSnapshot(): ImportComponentSnapshot {
    return {
      id: this.id.value,
      order: this.order,
      status: this.status.value,
      piece: this.piece,
      resourceId: this.resourceId.value,
      uris: this.uris,
    };
  }
}
