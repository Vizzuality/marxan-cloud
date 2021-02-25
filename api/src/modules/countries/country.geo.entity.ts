import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Dictionary } from 'lodash';
import { Column, Entity, PrimaryColumn } from 'typeorm';

export interface LocalName {
  /**
   * Local name of a country.
   *
   * E.g. "Italia"
   */
  name: string;

  /**
   * Locale code for this name, composed of the dash-separated two-letter
   * ISO-639 language code and the two-letter ISO 3166-1 alpha2 code.
   *
   * E.g. "it-IT"
   */
  locale: string;
}

@Entity('countries')
export class Country {
  @ApiProperty()
  @PrimaryColumn('character varying', { name: 'iso_3166_1_alpha2' })
  @Transform((_) => fakerStatic.address.countryCode())
  alpha2: string;

  @ApiProperty()
  @PrimaryColumn('character varying', { name: 'iso_3166_1_alpha3' })
  @Transform((_) => fakerStatic.address.countryCode())
  alpha3: string;

  @ApiProperty()
  @Column('character varying')
  @Transform((_) => fakerStatic.address.country())
  name: string;

  @ApiPropertyOptional()
  @Column('jsonb', { name: 'local_names' })
  localNames: Dictionary<LocalName>;
}

export class JSONAPICountryData {
  @ApiProperty()
  type = 'countries';

  @ApiProperty()
  id: string;

  @ApiProperty()
  attributes: Country;
}

export class CountryResult {
  @ApiProperty()
  data: JSONAPICountryData;
}
