import { ApiProperty } from '@nestjs/swagger';
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BBox, MultiPolygon } from 'geojson';
import { defaultSrid } from '@marxan/utils/geo';

@Entity('planning_areas')
export class PlanningArea {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'uuid',
    nullable: true,
    name: 'project_id',
  })
  projectId?: string | null;

  @ApiProperty()
  @Check('planning_area_the_geom_check', 'ST_IsValid(the_geom)')
  @Column('geometry', {
    name: 'the_geom',
    spatialFeatureType: 'MultiPolygon',
    srid: defaultSrid,
    nullable: false,
  })
  theGeom!: MultiPolygon;

  @ApiProperty()
  @Column('jsonb', { name: 'bbox' })
  bbox!: BBox;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp without time zone',
  })
  createdAt!: Date;
}
