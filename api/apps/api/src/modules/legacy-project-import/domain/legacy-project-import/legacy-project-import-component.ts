import { ArchiveLocation, ResourceId } from '@marxan/cloning/domain';
import { LegacyProjectImportPiece } from '@marxan/legacy-project-import';
import {
  LegacyProjectImportComponentStatus,
  LegacyProjectImportComponentStatuses,
} from './legacy-project-import-component-status';
import { LegacyProjectImportComponentId } from './legacy-project-import-component.id';
import { LegacyProjectImportComponentSnapshot } from './legacy-project-import-component.snapshot';

export class LegacyProjectImportComponent {
  private constructor(
    readonly id: LegacyProjectImportComponentId,
    readonly kind: LegacyProjectImportPiece,
    readonly resourceId: ResourceId,
    readonly order: number,
    readonly archiveLocation?: ArchiveLocation,
    readonly status: LegacyProjectImportComponentStatus = LegacyProjectImportComponentStatus.create(),
  ) {}

  static fromSnapshot(snapshot: LegacyProjectImportComponentSnapshot) {
    return new LegacyProjectImportComponent(
      new LegacyProjectImportComponentId(snapshot.id),
      snapshot.kind,
      new ResourceId(snapshot.resourceId),
      snapshot.order,
      snapshot.archiveLocation
        ? new ArchiveLocation(snapshot.archiveLocation)
        : undefined,
      new LegacyProjectImportComponentStatus(snapshot.status),
    );
  }

  static newOne(
    kind: LegacyProjectImportPiece,
    resourceId: ResourceId,
    order: number,
    archiveLocation?: ArchiveLocation,
  ): LegacyProjectImportComponent {
    return new LegacyProjectImportComponent(
      LegacyProjectImportComponentId.create(),
      kind,
      resourceId,
      order,
      archiveLocation,
    );
  }

  isReady() {
    return this.status.value === LegacyProjectImportComponentStatuses.Completed;
  }

  hasFailed() {
    return this.status.value === LegacyProjectImportComponentStatuses.Failed;
  }

  complete() {
    this.status.markAsCompleted();
  }

  markAsFailed() {
    this.status.markAsFailed();
  }

  toSnapshot(): LegacyProjectImportComponentSnapshot {
    return {
      id: this.id.value,
      order: this.order,
      status: this.status.value,
      kind: this.kind,
      resourceId: this.resourceId.value,
      archiveLocation: this.archiveLocation?.value,
    };
  }
}
