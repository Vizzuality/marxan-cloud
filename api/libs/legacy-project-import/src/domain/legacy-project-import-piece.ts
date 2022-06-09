export enum LegacyProjectImportPiece {
  PlanningGrid = 'planning-grid',
  Features = 'features',
  ScenarioPusData = 'scenario-pus-data',
  FeaturesSpecification = 'features-specification',
  Solutions = 'solutions',
  Input = 'input',
}

export class LegacyProjectImportPieceOrderResolver {
  private static legacyProjectImportPieceOrder: Record<
    LegacyProjectImportPiece,
    number
  > = {
    // TODO Establish proper order for pieces
    [LegacyProjectImportPiece.PlanningGrid]: 0,
    [LegacyProjectImportPiece.Input]: 0,
    [LegacyProjectImportPiece.Features]: 1,
    [LegacyProjectImportPiece.ScenarioPusData]: 1,
    [LegacyProjectImportPiece.FeaturesSpecification]: 2,
    [LegacyProjectImportPiece.Solutions]: 2,
  };

  static resolveFor(
    legacyProjectImportPiece: LegacyProjectImportPiece,
  ): number {
    return this.legacyProjectImportPieceOrder[legacyProjectImportPiece];
  }
}
