export enum LegacyProjectImportPiece {}

export class LegacyProjectImportPieceOrderResolver {
  private static legacyProjectImportPieceOrder: Record<
    LegacyProjectImportPiece,
    number
  > = {};

  static resolveFor(
    legacyProjectImportPiece: LegacyProjectImportPiece,
  ): number {
    return this.legacyProjectImportPieceOrder[legacyProjectImportPiece];
  }
}

export class LegacyProjectImportPieceRelativePathResolver {
  private static legacyProjectImportPieceRelativePaths: Record<
    LegacyProjectImportPiece,
    string
  > = {};

  static resolveFor(
    legacyProjectImportPiece: LegacyProjectImportPiece,
  ): string {
    return this.legacyProjectImportPieceRelativePaths[legacyProjectImportPiece];
  }
}
