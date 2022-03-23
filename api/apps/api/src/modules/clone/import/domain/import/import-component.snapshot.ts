import { ClonePiece } from '@marxan/cloning/domain';
import { ComponentLocationSnapshot } from '@marxan/cloning/domain/component-location.snapshot';
import { ImportComponentStatuses } from './import-component-status';

export interface ImportComponentSnapshot {
  readonly id: string;
  readonly piece: ClonePiece;
  readonly resourceId: string;
  readonly order: number;
  readonly uris: ComponentLocationSnapshot[];
  readonly status: ImportComponentStatuses;
}
