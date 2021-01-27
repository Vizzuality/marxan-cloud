import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID } from 'class-validator';
import { Column, Entity } from 'typeorm';
import { TimeUserEntityMetadata } from 'types/time-user-entity-metadata';

@Entity('admin_regions')
export class AdminRegion extends TimeUserEntityMetadata {
  @IsUUID(4)
  @Column('uuid')
  id: string;

  /**
   * @todo Add description
   */
  @ApiProperty()
  @IsInt()
  @Column('integer', { name: 'ogc_fid' })
  ogcFid: number;

  @ApiProperty()
  @Column('geometry')
  theGeom: object | null;

  /**
   * Level 0 name.
   */
  @ApiProperty()
  @Column('character varying')
  name0: string | null;

  /**
   * Level 1 name.
   */
  @ApiProperty()
  @Column('character varying')
  name1: string | null;

  /**
   * Level 2 name.
   */
  @ApiProperty()
  @Column('character varying')
  name2: string | null;
}
