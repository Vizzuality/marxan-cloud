import { ApiProperty } from '@nestjs/swagger';
import { BBox, Geometry } from 'geojson';
import { Column, PrimaryColumn, ViewColumn, ViewEntity } from 'typeorm';
import { BaseServiceResource } from '@marxan-api/types/resource.interface';

export const countryResource: BaseServiceResource = {
  className: 'Country',
  name: {
    singular: 'country',
    plural: 'countries',
  },
};

@ViewEntity('countries', {
  expression: `
    SELECT
      id,
      gid_0,
      name_0,
      the_geom,
      level,
      iso3,
      created_at,
      created_by,
      last_modified_at,
      bbox,
      max_pu_area_size,
      min_pu_area_size
    FROM admin_regions
    WHERE gid_0 IS NOT NULL AND gid_1 IS NULL AND gid_2 IS NULL
  `,
})
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
  @Column('geometry', {
    select: false,
    name: 'the_geom',
  })
  theGeom!: Geometry;

  /**
   * Bbox.
   */
  @ApiProperty()
  @Column('jsonb', { name: 'bbox' })
  bbox!: BBox;

  @ApiProperty()
  @ViewColumn({ name: 'max_pu_area_size' })
  maxPuAreaSize!: number;

  @ApiProperty()
  @ViewColumn({ name: 'min_pu_area_size' })
  minPuAreaSize!: number;
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
