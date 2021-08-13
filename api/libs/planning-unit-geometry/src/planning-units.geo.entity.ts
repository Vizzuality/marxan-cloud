import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Geometry } from 'geojson';
import { defaultSrid } from '@marxan/utils/geo';

export enum ShapeType {
  Square = 'square',
  Hexagon = 'hexagon',
  Irregular = 'irregular',
}

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
    enum: ShapeType,
    type: 'enum',
    name: 'type',
  })
  type!: ShapeType;

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
