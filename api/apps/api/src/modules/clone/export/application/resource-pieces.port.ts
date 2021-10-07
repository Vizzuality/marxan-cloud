import { ResourceId } from '../domain/export/resource.id';
import { ResourceKind } from '../domain/export/resource.kind';
import { ClonePart } from '../domain/export/clone-part/clone-part';

export abstract class ResourcePieces {
  abstract resolveFor(id: ResourceId, kind: ResourceKind): Promise<ClonePart[]>;
}
