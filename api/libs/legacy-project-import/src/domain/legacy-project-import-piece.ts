export enum LegacyProjectImportPiece {
  PlanningGrid = 'planning-grid',
  ShapefileFeature = 'shapefile-feature',
  NonShapefileFeatures = 'non-shapefile-features',
  ScenarioPusData = 'scenario-pus-data',
  FeatureSpecification = 'features-specification',
  Solutions = 'solutions',
}

export class LegacyProjectImportPieceOrderResolver {
  private static legacyProjectImportPieceOrder: Record<
    LegacyProjectImportPiece,
    number
  > = {
    // TODO Establish proper order for pieces
    [LegacyProjectImportPiece.PlanningGrid]: 0,
    [LegacyProjectImportPiece.ShapefileFeature]: 1,
    [LegacyProjectImportPiece.NonShapefileFeatures]: 1,
    [LegacyProjectImportPiece.ScenarioPusData]: 1,
    [LegacyProjectImportPiece.FeatureSpecification]: 2,
    [LegacyProjectImportPiece.Solutions]: 2,
  };

  static resolveFor(
    legacyProjectImportPiece: LegacyProjectImportPiece,
  ): number {
    return this.legacyProjectImportPieceOrder[legacyProjectImportPiece];
  }
}
