import { ApiProperty } from '@nestjs/swagger';
import { Geometry } from 'geojson';
import { Column, Entity, PrimaryColumn } from 'typeorm';
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

  @ApiProperty()
  @Column('text', { name: 'hash', nullable: false })
  hash!: string;
}
