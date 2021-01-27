import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TimeUserEntityMetadata } from 'types/time-user-entity-metadata';

@Entity('admin_regions')
export class AdminRegion {
  @IsUUID(4)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * @todo Add description
   */
  @ApiProperty()
  @IsInt()
  @Column('integer', { name: 'ogc_fid' })
  ogcFid: number;

  @ApiProperty()
  @Column('geometry', { name: 'the_geom' })
  theGeom: object | null;

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
