import { ApiProperty } from '@nestjs/swagger';
import { Check, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BBox, MultiPolygon } from 'geojson';
import { defaultSrid } from '@marxan/utils/geo';
import { TimeUserEntityMetadata } from '../../types/time-user-entity-metadata';

@Entity('planning-area')
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
  @Check('wdpa_geometry_valid_check', 'ST_IsValid(the_geom)')
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

  @Column('timestamp', { name: 'created_at' })
  createdAt!: Date;
}
