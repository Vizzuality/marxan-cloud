import { ProjectsPuEntity } from '@marxan-jobs/planning-unit-geometry';
import { ApiProperty } from '@nestjs/swagger';
import { Geometry } from 'geojson';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { GeometrySource } from './geometry-source.enum';

@Entity('features_data')
export class GeoFeatureGeometry {
  @ApiProperty()
  @PrimaryColumn()
  id!: string;

  @Column('geometry', { name: 'the_geom' })
  theGeom?: Geometry;

  @Column('jsonb')
  properties?: Record<string, string | number>;

  @Column(`enum`, {
    enum: GeometrySource,
    nullable: true,
  })
  source?: GeometrySource | null;

  @ApiProperty()
  @Column('uuid', { name: 'feature_id' })
  featureId?: string;

  @Column({
    name: 'amount_from_legacy_project',
    type: 'double precision',
    nullable: true,
  })
  amountFromLegacyProject?: number | null;

  @ApiProperty()
  @Column({ name: 'hash', insert: false, update: false })
  hash!: string;

  @Column('uuid', { name: 'project_pu_id', nullable: true })
  projectPuId?: string | null;

  @ManyToOne(() => ProjectsPuEntity, (projectPu) => projectPu.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    referencedColumnName: 'id',
    name: 'project_pu_id',
  })
  projectPu?: ProjectsPuEntity;
}
