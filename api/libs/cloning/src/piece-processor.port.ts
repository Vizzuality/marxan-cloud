import { ClonePiece } from './domain/clone-piece';

export abstract class PieceProcessor<I, O> {
  abstract run(input: I): Promise<O>;

  abstract isSupported(piece: ClonePiece): boolean;
}
