/**
 * @todo We are replicating the same code that we have in the api. If we update something here we should also replicate it in the api side.
 */
import { ApiProperty } from '@nestjs/swagger';
import { Check, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { MultiPolygon } from 'geojson';
import { defaultSrid } from '@marxan/utils/geo';
import { IUCNCategory } from '@marxan/iucn';
import { TimeUserEntityMetadata } from '../../types/time-user-entity-metadata';

@Entity('wdpa')
export class ProtectedArea extends TimeUserEntityMetadata {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * Level 1 id.
   */
  @ApiProperty()
  @Column('text', { name: 'status', nullable: true })
  status?: string | null;

  /**
   * geometry column.
   */
  @ApiProperty()
  @Index(`wdpa_geom_idx`, {
    spatial: true,
  })
  @Check('wdpa_geometry_valid_check', 'ST_IsValid(the_geom)')
  @Column('geometry', {
    name: 'the_geom',
    spatialFeatureType: 'MultiPolygon',
    srid: defaultSrid,
    select: false,
    nullable: true,
  })
  theGeom?: MultiPolygon | null;

  @Column({
    type: 'float8',
    name: 'wdpaid',
    nullable: true,
  })
  wdpaId?: number | null;

  @Column({
    name: 'full_name',
    type: 'varchar',
    nullable: true,
  })
  fullName?: string | null;

  @Column({
    type: 'varchar',
    name: 'iucn_cat',
    nullable: true,
  })
  iucnCategory?: IUCNCategory | null;

  @Column({
    type: 'float8',
    name: 'shape_leng',
    nullable: true,
  })
  shapeLength?: number | null;

  @Column({
    type: 'float8',
    name: 'shape_area',
    nullable: true,
  })
  shapeArea?: number | null;

  @Column({
    type: 'text',
    name: 'desig',
    nullable: true,
  })
  designation?: string | null;

  /**
   * Country where the protected area is located.
   *
   * This references the admin_regions.gid_0 column.
   */
  @Column({
    type: 'character varying',
    name: 'iso3',
    length: 3,
    comment: '',
    nullable: true,
  })
  countryId?: string | null;

  @Column({
    type: 'uuid',
    nullable: true,
    name: 'project_id',
  })
  projectId?: string | null;
}
