import {
  ArchiveLocation,
  ResourceId,
  ResourceKind,
} from '@marxan/cloning/domain';
import { ImportComponent } from '../domain';

export abstract class ImportResourcePieces {
  abstract resolveFor(
    id: ResourceId,
    kind: ResourceKind,
    archiveLocation: ArchiveLocation,
  ): Promise<ImportComponent[]>;
}
