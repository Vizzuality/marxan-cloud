/**
 * @todo move the planningUnitsGeom entity to the api
 */
import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('planning_units_geom')
export class PlanningUnitsGeom {
  /**
   * id
   */
  @ApiProperty()
  @PrimaryColumn('uuid', { name: 'id' })
  id!: string;

  /**
   * geometry column.
   */
  @ApiProperty()
  @Column('geometry', { name: 'the_geom', select: false })
  theGeom!: any;
}
