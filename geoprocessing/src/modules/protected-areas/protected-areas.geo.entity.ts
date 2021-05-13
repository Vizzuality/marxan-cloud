/**
 * @todo We are replicating the same code that we have in the api. If we update something here we should also replicate it in the api side.
 */
import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { Geometry } from 'geojson';

/**
 * @todo We have this enum duplicated in the api service
 * @file api/src/modules/protected-areas/protected-area.geo.entity.ts
 */
export enum IUCNCategory {
  Ia = 'Ia',
  Ib = 'Ib',
  II = 'II',
  III = 'III',
  IV = 'IV',
  V = 'V',
  VI = 'VI',
  NotApplicable = 'Not Applicable',
  NotAssigned = 'Not Assigned',
  NotReported = 'Not Reported',
}
@Entity('wdpa')
export class ProtectedArea {
  /**
   * id
   */
  @ApiProperty()
  @PrimaryColumn('uuid', { name: 'id' })
  id!: string;

  /**
   * wdpa name.
   */
  @ApiProperty()
  @Column('character varying', { name: 'fullName' })
  fullName!: string;

  /**
   * Level 1 id.
   */
  @ApiProperty()
  @Column('character varying', { name: 'status' })
  status!: string;

  /**
   * geometry column.
   */
  @ApiProperty()
  @Column('geometry', { name: 'the_geom', select: false })
  theGeom!: Geometry;
}
