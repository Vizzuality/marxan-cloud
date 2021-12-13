import { ClonePiece, ComponentId } from '@marxan/cloning/domain';

export interface ExportComponentSnapshot {
  readonly id: ComponentId;
  readonly piece: ClonePiece;
  readonly resourceId: string;
  readonly finished: boolean;
  readonly uri?: string;
}
