import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Dictionary } from 'lodash';
import { LocalName } from '../country.api.entity';

export class CreateCountryDTO {
  /**
   * ISO 3166-1 alpha2 code
   */
  @ApiProperty()
  id: string;

  /**
   * English name
   */
  @ApiProperty()
  name: string;

  /**
   * A dictionary of (name, locale) tuples.
   *
   * E.g. ('Italia', 'it-IT')
   */
  @ApiPropertyOptional()
  localNames: Dictionary<LocalName>;
}
