/**
 * @todo We are replicating the same code that we have in the api. If we update something here we should also replicate it in the api side.
 */
import { ApiProperty } from '@nestjs/swagger';
import { Check, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { MultiPolygon } from 'geojson';
import { TimeUserEntityMetadata } from '../../types/time-user-entity-metadata';

/**
 *  represents spatial data using longitude and latitude coordinates on the Earth's surface as defined in the WGS84 standard, which is also used for the Global Positioning System (GPS)
 */
const srid = 4326;

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
  status!: string;

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
    srid,
    select: false,
    nullable: true,
  })
  theGeom?: MultiPolygon | null;

  @Column({
    type: 'float8',
    nullable: true,
  })
  wdpaid?: number | null;

  @Column({
    name: 'full_name',
    type: 'varchar',
    nullable: true,
  })
  fullName?: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  iucn_cat?: string | null; //'Not Applicable' | 'Not Reported';

  @Column({
    type: 'float8',
    nullable: true,
  })
  shape_leng?: number | null;

  @Column({
    type: 'float8',
    nullable: true,
  })
  shape_area?: number | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  desig?: string | null;

  @Column({
    type: 'character varying',
    length: 3,
    comment: '',
    nullable: true,
  })
  iso3?: string | null;
}
