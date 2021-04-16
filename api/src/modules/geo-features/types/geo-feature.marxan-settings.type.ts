/**
 * Marxan settings for a GeoFeature.
 *
 * @todo Only properties manageable via the main UI user flow are currently
 * defined: advanced settings will need to be added.
 */
export interface MarxanSettingsForGeoFeature {
  /**
   * Species penalty factor.
   */
  spf: number;

  /**
   * Feature penalty factor.
   */
  fpf: number;
}
