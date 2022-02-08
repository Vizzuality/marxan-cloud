import { ClonePiece } from '@marxan/cloning/domain';
import { ComponentLocationSnapshot } from '@marxan/cloning/domain/component-location.snapshot';

export interface ImportComponentSnapshot {
  readonly id: string;
  readonly piece: ClonePiece;
  readonly resourceId: string;
  readonly order: number;
  readonly uris: ComponentLocationSnapshot[];
  readonly finished: boolean;
}
