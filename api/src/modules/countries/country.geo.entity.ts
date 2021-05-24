import { ApiProperty } from '@nestjs/swagger';
import { BBox } from 'geojson';
import { Column, PrimaryColumn, ViewEntity } from 'typeorm';
import { BaseServiceResource } from 'types/resource.interface';

export const countryResource: BaseServiceResource = {
  className: 'Country',
  name: {
    singular: 'country',
    plural: 'countries',
  },
};

@ViewEntity('countries')
export class Country {
  @ApiProperty()
  @PrimaryColumn()
  id!: string;

  /**
   * Country id (ISO 3166-1 alpha-3).
   */
  @ApiProperty()
  @PrimaryColumn('character varying', { name: 'gid_0' })
  gid0!: string;

  /**
   * Country name
   */
  @ApiProperty()
  @Column('character varying', { name: 'name_0' })
  name0!: string;

  /**
   * @todo Add description. Also we can probably do better than using the `any`
   * type.
   */
  @ApiProperty()
  @Column('geometry', { name: 'the_geom' })
  theGeom: any;

  /**
   * Bbox.
   */
  @ApiProperty()
  @Column('jsonb', { name: 'bbox' })
  bbox!: BBox;
}

export class JSONAPICountryData {
  @ApiProperty()
  type = 'countries';

  @ApiProperty()
  id!: string;

  @ApiProperty()
  attributes!: Country;
}

export class CountryResult {
  @ApiProperty()
  data!: JSONAPICountryData;
}
