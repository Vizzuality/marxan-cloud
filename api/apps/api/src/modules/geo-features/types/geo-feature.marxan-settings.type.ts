import { IsNumber, IsOptional, Max, Min } from 'class-validator';

/**
 * Marxan settings for a GeoFeature.
 *
 * @todo Only properties manageable via the main UI user flow are currently
 * defined: advanced settings will need to be added.
 */
export class MarxanSettingsForGeoFeature {
  /**
   * Protection target for this feature, as proportion of the conservation
   * feature to be included in the reserve system.
   *
   * Use [0, 1] range (for 0% to 100%).
   */
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(1)
  prop?: number;

  /**
   * Protection target for this feature, expressed in the same unit as in
   * puvspr.dat.
   *
   * For example, number of individuals or hectares, depending on context.
   */
  @IsNumber()
  @IsOptional()
  @Min(0)
  target?: number;

  /**
   * Feature penalty factor.
   */
  @IsNumber()
  @IsOptional()
  fpf?: number;
}
