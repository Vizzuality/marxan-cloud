/**
 * @todo We are replicating the same code that we have in the api. If we update something here we should also replicate it in the api side.
 */
import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('admin_regions')
export class AdminArea {
  /**
   * Country id (ISO 3166-1 alpha-3).
   */
  @ApiProperty()
  @PrimaryColumn('character varying', { name: 'gid_0' })
  gid0: string;

  /**
   * Country name.
   */
  @ApiProperty()
  @PrimaryColumn('character varying', { name: 'name_0' })
  name0: string;

  /**
   * Level 1 id.
   */
  @ApiProperty()
  @Column('character varying', { name: 'gid_1' })
  gid1: string;

  /**
   * Level 1 name.
   */
  @ApiProperty()
  @Column('character varying', { name: 'name_1' })
  name1: string;

  /**
   * Level 2 id.
   */
  @ApiProperty()
  @Column('character varying', { name: 'gid_2' })
  gid2: string;

  /**
   * Level 2 name.
   */
  @ApiProperty()
  @Column('character varying', { name: 'name_2' })
  name2: string;

  /**
   * Level 2 id.
   */
  @ApiProperty()
  @Column('geometry', { name: 'the_geom', select: false })
  theGeom: any;
}
