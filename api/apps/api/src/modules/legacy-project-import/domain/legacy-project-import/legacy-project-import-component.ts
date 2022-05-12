import { ArchiveLocation } from '@marxan/cloning/domain';
import {
  LegacyProjectImportPiece,
  LegacyProjectImportPieceOrderResolver,
} from '@marxan/legacy-project-import';
import { LegacyProjectImportComponentStatus } from './legacy-project-import-component-status';
import { LegacyProjectImportComponentId } from './legacy-project-import-component.id';
import { LegacyProjectImportComponentSnapshot } from './legacy-project-import-component.snapshot';

export class LegacyProjectImportComponent {
  private constructor(
    readonly id: LegacyProjectImportComponentId,
    readonly kind: LegacyProjectImportPiece,
    readonly order: number,
    private status: LegacyProjectImportComponentStatus = LegacyProjectImportComponentStatus.create(),
    private errors: string[] = [],
    private warnings: string[] = [],
  ) {}

  static fromSnapshot(snapshot: LegacyProjectImportComponentSnapshot) {
    return new LegacyProjectImportComponent(
      new LegacyProjectImportComponentId(snapshot.id),
      snapshot.kind,
      snapshot.order,
      new LegacyProjectImportComponentStatus(snapshot.status),
    );
  }

  static newOne(kind: LegacyProjectImportPiece): LegacyProjectImportComponent {
    return new LegacyProjectImportComponent(
      LegacyProjectImportComponentId.create(),
      kind,
      LegacyProjectImportPieceOrderResolver.resolveFor(kind),
    );
  }

  isReady() {
    return this.status.isReady();
  }

  hasFailed() {
    return this.status.hasFailed();
  }

  complete(warnings: string[] = []) {
    this.status = this.status.markAsCompleted();
    this.warnings.push(...warnings);
  }

  markAsFailed(errors: string[] = [], warnings: string[] = []) {
    this.status = this.status.markAsFailed();
    this.errors.push(...errors);
    this.warnings.push(...warnings);
  }

  toSnapshot(): LegacyProjectImportComponentSnapshot {
    return {
      id: this.id.value,
      order: this.order,
      status: this.status.toSnapshot(),
      kind: this.kind,
      errors: this.errors,
      warnings: this.warnings,
    };
  }
}
