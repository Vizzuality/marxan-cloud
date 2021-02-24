import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('admin_regions')
export class AdminArea {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * @todo Add description.
   */
  @ApiProperty()
  @Column('integer', { name: 'ogc_fid' })
  ogcFid: number;

  /**
   * @todo Add description. Also we can probably do better than using the `any`
   * type.
   */
  @ApiProperty()
  @Column('geometry', { name: 'the_geom' })
  theGeom: any | null;

  /**
   * Level 0 name.
   */
  @ApiProperty()
  @Column('character varying', { name: 'name_0' })
  name0: string | null;

  /**
   * Level 1 name.
   */
  @ApiProperty()
  @Column('character varying', { name: 'name_1' })
  name1: string | null;

  /**
   * Level 2 name.
   */
  @ApiProperty()
  @Column('character varying', { name: 'name_2' })
  name2: string | null;
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
