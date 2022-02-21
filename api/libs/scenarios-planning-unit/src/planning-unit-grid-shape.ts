/**
 * Kinds of shapes of planning units. Each project can use only one.
 *
 * There are two related PostgreSQL types, both named `planning_unit_grid_shape`
 * - one in the apidb, one in the geoprocessingdb.
 *
 * When updating this enum - if at all needed in the future - edits should be
 * synced with the relevant PostgreSQL types. See for example these migrations:
 * - SyncPuShapeEnumNameFromApiToGeoprocessing1645449750000
 * - SyncPuShapeEnumFromGeoprocessingToApi1645449750000
 */
export enum PlanningUnitGridShape {
  /**
   * Shape of planning units generated via ST_SquareGrid()
   */
  Square = 'square',
  /**
   * Shape of planning units generated via ST_HexagonGrid()
   */
  Hexagon = 'hexagon',
  /**
   * Shape of planning units that have been created from user-uploaded
   * geometries.
   */
  FromShapefile = 'from_shapefile',
  /**
   * @todo Not currently used. This may be handled in the future when
   * _generated_ (as opposed to user-uploaded via shapefile) planning units may
   * have an irregular (as opposed to square or hexagonal) shape, for example
   * by following watershed basins.
   */
  Irregular = 'irregular',
}
