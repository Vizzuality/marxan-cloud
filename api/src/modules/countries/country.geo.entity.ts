import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseServiceResource } from 'types/resource.interface';

export const countryResource: BaseServiceResource = {
  className: 'Country',
  name: {
    singular: 'country',
    plural: 'countries',
  },
};

@Entity('countries')
export class Country {
  get id() {
    return this.gid0;
  }

  /**
   * Country id (ISO 3166-1 alpha-3).
   */
  @ApiProperty()
  @PrimaryColumn('character varying', { name: 'gid_0' })
  gid0: string;

  /**
   * Country name
   */
  @ApiProperty()
  @Column('character varying', { name: 'name_0' })
  name0: string;

  /**
   * @todo Add description. Also we can probably do better than using the `any`
   * type.
   */
  @ApiProperty()
  @Column('geometry', { name: 'the_geom' })
  theGeom: any;
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
