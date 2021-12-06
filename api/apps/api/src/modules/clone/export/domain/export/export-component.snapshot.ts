import { ClonePiece } from '@marxan/cloning/domain';
import { ComponentId } from './export-component/component.id';

export interface ExportComponentSnapshot {
  readonly id: ComponentId;
  readonly piece: ClonePiece;
  readonly resourceId: string;
  readonly finished: boolean;
  readonly uri?: string;
}
