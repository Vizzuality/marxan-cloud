import { ResourceId } from '../domain/export/resource.id';
import { ResourceKind } from '../domain/export/resource.kind';
import { ExportComponent } from '../domain/export/export-component/export-component';

export abstract class ResourcePieces {
  abstract resolveFor(
    id: ResourceId,
    kind: ResourceKind,
  ): Promise<ExportComponent[]>;
}
