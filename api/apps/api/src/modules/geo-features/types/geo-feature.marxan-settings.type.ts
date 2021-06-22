import { IsNumber } from 'class-validator';

/**
 * Marxan settings for a GeoFeature.
 *
 * @todo Only properties manageable via the main UI user flow are currently
 * defined: advanced settings will need to be added.
 */
export class MarxanSettingsForGeoFeature {
  /**
   * Species penalty factor.
   */
  @IsNumber()
  spf!: number;

  /**
   * Feature penalty factor.
   */
  @IsNumber()
  fpf!: number;
}
