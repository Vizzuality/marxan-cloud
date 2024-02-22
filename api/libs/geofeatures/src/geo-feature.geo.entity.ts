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

  /**
   * A stable id is not guaranteed to be globally unique, but it will be unique
   * across each feature.
   *
   * This stable id is kept as is (hence the name) when feature data is copied
   * over to a new project as part of project cloning. This way, the link
   * established between features (in apidb) and all the matching
   * `features_data` rows, via `GeoFeature.featureDataIds`, is preserved across
   * clones (i.e. no need to update `GeoFeature.featureDataIds` throughout the
   * import side of a cloning or project upload flow).
   */
  @ApiProperty()
  @Column('uuid', { name: 'stable_id' })
  stableId!: string;

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
    name: 'amount',
    type: 'double precision',
    nullable: true,
  })
  amount?: number | null;

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
