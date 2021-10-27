import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Country } from 'modules/countries/country.geo.entity';
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseServiceResource } from 'types/resource.interface';

export const adminAreaResource: BaseServiceResource = {
  className: 'AdminArea',
  name: {
    singular: 'admin_area',
    plural: 'admin_areas',
  },
};

@Entity('admin_regions')
export class AdminArea extends Country {
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
   * Level 1 id.
   */
  @ApiProperty()
  @PrimaryColumn('character varying', { name: 'gid_1' })
  gid1: string;

  /**
   * Level 1 name.
   */
  @ApiProperty()
  @PrimaryColumn('character varying', { name: 'name_1' })
  name1: string;

  /**
   * Level 2 id.
   */
  @ApiPropertyOptional()
  @PrimaryColumn('character varying', { name: 'gid_2' })
  gid2?: string;

  /**
   * Level 2 name.
   */
  @ApiPropertyOptional()
  @Column('character varying', { name: 'name_2' })
  name2?: string;
}

export class JSONAPIAdminAreaData {
  @ApiProperty()
  type = 'administative-areas';

  @ApiProperty()
  id: string;

  @ApiProperty()
  attributes: AdminArea;
}

export class AdminAreaResult {
  @ApiProperty()
  data: JSONAPIAdminAreaData;
}
