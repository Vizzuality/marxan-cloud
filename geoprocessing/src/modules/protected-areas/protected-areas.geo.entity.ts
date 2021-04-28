/**
 * @todo We are replicating the same code that we have in the api. If we update something here we should also replicate it in the api side.
 */
import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('wdpa')
export class ProtectedArea {
  /**
   * id
   */
  @ApiProperty()
  @PrimaryColumn('uuid', { name: 'id' })
  id: string;

  /**
   * wdpa name.
   */
  @ApiProperty()
  @Column('character varying', { name: 'fullName' })
  fullName: string;

  /**
   * Level 1 id.
   */
  @ApiProperty()
  @Column('character varying', { name: 'status' })
  status: string;

  /**
   * geometry column.
   */
  @ApiProperty()
  @Column('geometry', { name: 'the_geom', select: false })
  theGeom: any;
}
