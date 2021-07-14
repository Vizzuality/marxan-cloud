import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BBox, Geometry } from 'geojson';
import { defaultSrid } from '@marxan/utils/geo';

export enum AdminLevel {
  Country = 'country',
  Adm1 = 'adm_1',
  Amd2 = 'adm_2',
}

export const adminAreaTableName = 'admin_regions' as const;
// property names, not db names in indexes: https://github.com/typeorm/typeorm/issues/930
@Entity(adminAreaTableName)
@Index('admin_regions_l012_ids', ['gid0', 'gid1', 'gid2', 'level'])
@Index('unique_l2_regions', ['gid2', 'level'], {
  unique: true,
  where: "level = 'adm_2'::adm_level",
})
@Index('unique_l1_regions', ['gid1', 'level'], {
  unique: true,
  where: "level = 'adm_1'::adm_level",
})
@Index('unique_l0_regions', ['gid0', 'level'], {
  unique: true,
  where: "level = 'country'::adm_level",
})
export class AdminArea {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid', {
    comment: ``,
  })
  id!: string;

  /**
   * Country id (ISO 3166-1 alpha-3).
   */
  @ApiPropertyOptional()
  @Column('character varying', { name: 'gid_0', nullable: true })
  gid0?: string | null;

  /**
   * Country name.
   */
  @ApiPropertyOptional()
  @Column('character varying', { name: 'name_0', nullable: true })
  name0?: string | null;

  @ApiPropertyOptional()
  @Column('character varying', { name: 'gid_1', nullable: true })
  gid1?: string | null;

  @ApiPropertyOptional()
  @Column('character varying', { name: 'name_1', nullable: true })
  name1?: string | null;

  @ApiPropertyOptional()
  @Column('character varying', { name: 'gid_2', nullable: true })
  gid2?: string | null;

  @ApiPropertyOptional()
  @Column('character varying', { name: 'name_2', nullable: true })
  name2?: string | null;

  @ApiPropertyOptional()
  @Column('character varying', {
    length: 3,
    nullable: true,
  })
  iso3?: string | undefined | null;

  @ApiProperty()
  @PrimaryColumn({
    type: 'enum',
    name: 'level',
    enumName: 'adm_level',
    enum: AdminLevel,
    nullable: false,
  })
  level!: AdminLevel;

  @ApiProperty()
  @Index(`admin_regions_geom_idx`, {
    spatial: true,
  })
  @Check('admin_regions_geometry_valid_check', 'ST_IsValid(the_geom)')
  @Column('geometry', {
    name: 'the_geom',
    select: false,
    comment: ``,
    spatialFeatureType: 'MultiPolygon',
    srid: defaultSrid,
    nullable: true,
  })
  theGeom?: Geometry | undefined | null;

  @ApiProperty()
  @Column('jsonb', { name: 'bbox', nullable: true })
  bbox?: BBox | undefined | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp without time zone',
    nullable: true,
  })
  createdAt?: Date | null;

  @Column('uuid', { name: 'created_by', nullable: true })
  createdBy?: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
  })
  @Column('double precision', {
    name: 'min_pu_area_size',
    nullable: true,
  })
  minPuAreaSize?: number | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
  })
  @Column('double precision', {
    name: 'max_pu_area_size',
    nullable: true,
  })
  maxPuAreaSize?: number | null;

  @UpdateDateColumn({
    name: 'last_modified_at',
    type: 'timestamp without time zone',
    nullable: true,
  })
  lastModifiedAt?: Date | null;
}
