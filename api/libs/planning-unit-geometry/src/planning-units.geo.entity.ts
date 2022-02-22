import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Geometry } from 'geojson';
import { defaultSrid } from '@marxan/utils/geo';
import { PlanningUnitGridShape } from '@marxan/scenarios-planning-unit';

@Entity('planning_units_geom')
export class PlanningUnitsGeom {
  /**
   * id
   */
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  /**
   * geometry column.
   */
  @ApiProperty()
  @Column('geometry', {
    name: 'the_geom',
    select: false,
    spatialFeatureType: 'MultiPolygon',
    srid: defaultSrid,
  })
  theGeom!: Geometry;

  @Column({
    /**
     * Strictly speaking we don't use the PlanningUnitGridShape.Irregular value
     * for the time being, but to keep things simple we won't subset the values
     * here. Type info below should still provide guidance when referencing
     * values of this column.
     */
    enum: PlanningUnitGridShape,
    type: 'enum',
    name: 'type',
  })
  type!: Omit<PlanningUnitGridShape, 'irregular'>;

  @Column({
    nullable: true,
    type: 'int',
  })
  size?: number | undefined | null;

  /**
   * For custom planning unit grids, this links back to the parent project
   * where the custom grid is used.
   */
  @Column({
    name: 'project_id',
    nullable: true,
    type: 'uuid',
  })
  projectId?: string | undefined | null;
}
